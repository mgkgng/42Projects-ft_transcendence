import { 
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {Client} from './game.Client'
import {Room} from "./game.Room"
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { UserBlockEntity } from "src/entity/UserBlock.entity";
import { MainServerService } from "src/mainServer/mainServer.service";
import { JwtService } from '@nestjs/jwt';
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { UserService } from "src/user/user.service";
import { RoomUpdate } from "./game.utils";
import { UserEntity } from "src/entity/User.entity";

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
//export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	clients: Map<string, Client>;
	rooms: Map<string, Room>;
	roomlistClients: Array<any>;
	queue: Array<Client>;
	control: Map<string, any>;

	constructor(private mainServerService : MainServerService, private jwtService: JwtService, 
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>,
				private dataSource : DataSource,
				private userService : UserService,
				private jwtServer: JwtService
	) {
		this.clients = new Map<string, Client>();
		this.rooms = new Map<string, Room>();
		this.roomlistClients = [];
		this.queue = [];
		this.control = new Map<string, any>();

		// Testing rooms
		// this.addRoomsForTest();
	}

	@WebSocketServer()
	server: Server;

	// addRoomsForTest() {
	// 	let room1 = new Room(['testPlayer1'], 'TestRoom1', 25, 5, false,
	// 		this.gameRep, this.mainServerService, this.dataSource);

	// 	let room2 = new Room(['testPlayer2'], "Welcome to this map", 18, 3, false,
	// 		this.gameRep, this.mainServerService, this.dataSource);
	
	// 	this.rooms.set(room1.id, room1);
	// 	this.rooms.set(room2.id, room2);
	// 	console.log(this.rooms);
	// }

	public async handleConnection(client: any, ...args: any[]) {
		console.log("Connection!!", client.id);
		const user: any = (this.jwtService.decode(client.handshake.headers.authorization.split(' ')[1]));
  		console.log("test", user);
		let newClient = new Client(client, user.username, {});
		const user_db = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user").
		where("user.username = :username", {username: user.username_42}).getOne();
		this.clients.set(newClient.id, newClient);

		// Should send it only once
		client.emit("GetConnectionInfo", {
			id: newClient.id,
			user: {
				username: user_db.username,
				displayname: user_db.display_name,
				image_url: user_db.img_url,
				campus_name: user_db.campus_name,
				campus_country: user_db.campus_country
			}
		})
	}

	public handleDisconnect(client: any): void {
		console.log("Disconnection...", client.id);
		this.clients.delete(client.id);
    }

	@SubscribeMessage("JoinQueue")
	joinQueue(@MessageBody() data: any) {
		console.log("Join Queue", data);
		let client = this.getClient(data);
		//TODO: should maybe optimize the algorithm later -- for includes
		if (client && (client.room.length || this.queue.includes(client)))
			return ;

		this.queue.push(client);

		// TODO plus tard
		if (this.queue.length > 1) {
			let room = new Room([this.queue[0], this.queue[1]], [], "", "Medium", 10, "Normal", "Normal", true, "", this.gameRep, this.mainServerService, this.dataSource, this.userService);
			// TODO: think about it: if i just join a match randomlmy like this, it could be by default a private game
			this.queue[0].room = room.id;
			this.queue[1].room = room.id;

			room.broadcast('MatchFound', room.id);

			this.rooms.set(room.id, room);
			this.queue = this.queue.slice(2);
		}
	}

	@SubscribeMessage("LeaveQueue")
	leaveQueue(@MessageBody() data: any) {
		let index = this.queue.indexOf(this.getClient(data));
		if (index > -1)
			this.queue.splice(index, 1);
		// TODO algo & protection revoir
	}

	@SubscribeMessage("RoomCheck")
	roomCheck(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		console.log("RoomCheck", data);

		let room = this.getRoom(data.room);

		if (!room) {
			client.emit("RoomNotFound");
			return ;
		}

		client.emit("RoomInfo", {
			roomHost: room.hostname,
			players: room.players,
			maxpoint: room.maxpoint,
			scores: room.scores,
			mapSize: [room.pong.size[0], room.pong.size[1]],
			paddleSize: room.pong.paddleSize
		});

		console.log("data was sent!");
	}

	@SubscribeMessage("PaddleMove")
	paddleMove(@MessageBody() data: any) {
		let room = this.getRoom(data.room);

		// calcul algorithm launched here

		let intervalId = setInterval(() => {
			room.pong.movePaddle(data.player, data.left);
			room.broadcast("PaddleUpdate", {
				player: data.player,
				paddlePos: room.pong.paddlePos[data.player]
			});
		}, 20);
		this.control.set(data.client, intervalId);
	}

	@SubscribeMessage("PaddleStop")
	paddleStop(@MessageBody() data: any) {
		clearInterval(this.control.get(data));
		this.control.delete(data);
	}

	@SubscribeMessage("AskRooms")
	askRooms(@ConnectedSocket() client: Socket) {
		//TODO should check if it still works when the client leaves the modal
		this.roomlistClients.push(client);

		let allRooms = [];
		for (let room of this.rooms.values()) {
			if (room.privateMode)
				continue ;
			allRooms.push({
				id: room.id,
				players: room.players,
				title: room.title,
				mapInfo: room.mapInfo
			});
		}
		client.emit("GetAllRooms", { rooms: allRooms });
	}

	@SubscribeMessage("CreateRoom")
	async createRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		console.log("CreateRoom", data);
		
		// TODO should be able to have client's room state
		// if (client.room.length)
		// 	return ;
		let user = await this.getPlayerInfo(data.username);
		let room = new Room([user], [client], data.title, data.mapSize, data.maxPoint,
			data.puckSpeed, data.paddleSize, data.privateMode, data.username,
			this.gameRep, this.mainServerService, this.dataSource, this.userService);
		this.rooms.set(room.id, room);

		// TODO should be able to set client's room state
		// client.room = room.id;

		client.emit("RoomCreated", room.id);
		this.updateRooms(RoomUpdate.NewRoom, {
			id: room.id,
			players: room.players,
			title: room.title,
			mapInfo: room.mapInfo
		});
	}

	@SubscribeMessage("JoinRoom")
	async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		console.log("JoinRoom", client.id);
		let room = this.getRoom(data.roomId);
		if (!room || (room.players.length > 1 && data.play)) {
			client.emit("JoinRoomRes", {
				allowed: false, 
				roomId: undefined });
			return ;
		} else if (data.play) {
			const newPlayer = await this.getPlayerInfo(data.username);
			room.broadcast("PlayerUpdate", {
				join: true,
				userInfo: newPlayer
			});
			room.addPlayer(client, newPlayer);
			console.log("hahaha");
			// this.updateRooms(RoomUpdate.PlayerJoin, {
			// 	id: room.id,
			// 	player: newPlayer
			// });
		} else { //TODO I DONT UDNERSTAND WHY
			// room.broadcast("WatcherUpdate", { //TODO potentiellement
			// 	join: true
			// })
			room.addClient(client);
		}
		console.log("reponse ready", data);
		client.emit("JoinRoomRes", {
			allowed: true,
			roomId: data.roomId
		});	

	}

	@SubscribeMessage("ExitRoom")
	exitRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		let room = this.getRoom(data.roomId);
		if (!room)
			return ;

		let userIndex = (room.players[0].username_42 == user.username_42) ? 0 : 
			(room.players[1]?.username_42 == user.username_42) ? 1 :
			-1;
 		if (userIndex != -1) {
			room.players.splice(userIndex, 1);
			if (user.username_42 == room.hostname)
				room.hostname = room.players[0].username_42;
			// this.clients.delete() // TODO delete from clients
			room.broadcast("PlayerUpdate", {
				join: false,
				userInfo: user.username_42,
				hostname: room.hostname
			});
		}

		if (!room.players.length) {//TODO or should I wait for every watch client to leave the room?
			this.updateRooms(RoomUpdate.DeleteRoom, {
				id: room.id
			});
			this.rooms.delete(room.id);
		} else {
			this.updateRooms(RoomUpdate.PlayerExit, {
				id: room.id,
				userIndex: userIndex
			});
		}
	}

	@SubscribeMessage("isReady")
	setReady(@MessageBody() data: any, @Request() req) {
		console.log("ready");

		const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		let room = this.getRoom(data.roomId);
		if (!room || user.username_42 != room.players[1].username_42)//for example
			return ;

		room.ready = data.ready;
		room.broadcast("ReadyUpdate", { ready: room.ready });
	}

	@SubscribeMessage("StartGame")
	startGame(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		let room = this.getRoom(data.roomId);
		if (!room || user.username_42 != room.players[0].username_42)
			return ;

		if (!room.ready) {
			client.emit("StartGameFail");
			return ;
		}
		room.broadcast("GameStart", undefined);
		room.startPong();
	}

	updateRooms(type: number, data: any) { // maybe there could be a better way?
		this.broadcast(this.roomlistClients, "UpdateRooms", {
			updateType: type,
			roomData: data
		});
	}

	broadcast(clients: any, event: string, data: any) {
		for (let client of clients)
			client.emit(event, data);
	}

	static broadcast(clients: any, event: string, data: any) {
		for (let client of clients)
			client.emit(event, data);
	}

	@SubscribeMessage("newChatGameMessage")
	// {roomId: string, content: string}
	async newChatGameMessage(@MessageBody() data: any, @Request() req) {
		let room = this.getRoom(data.roomId);
		const user : any = (this.jwtService.decode(req.handshake.headers.authorization.split(' ')[1]));
		
		room.addMessage(user.username, data.content);
	}

	@SubscribeMessage("getChatGameMessage")
	// {roomId: string}
	async getChatGameMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		let room = this.getRoom(data.roomId);
		client.emit("getChatGameMessage", room.chat);	
	} 
	@SubscribeMessage("getHistory")
	async getHistGame(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req) {
		let id_user = await this.mainServerService.getIdUser(req);
		const res = await this.dataSource.getRepository(GameEntity).createQueryBuilder("game")
		.innerJoin("game.player1", "user1")
		.innerJoin("game.player2", "user2")
		.where("game.player1.id_g = :u or game.player2.id_g = :u", {u: id_user})
		.select(["game.player1_score", "game.player2_score", "user1.username", "user2.username", "user1.img_url", "user1.img", "user2.img_url", "user2.img", "game.date_game"]).getMany();
		
		client.emit("resHistory", res);
	}

	getClient(id: string) { return (this.clients.get(id)); }
	getRoom(id: string) { return (this.rooms.get(id)); }

	async getPlayerInfo(player: any) {
		const userdata = await this.userService.findOne(player)
		return ({
			username: userdata.username,
			username_42: userdata.username_42,
			displayname: userdata.display_name,
			image_url: userdata.img_url,
			campus_name: userdata.campus_name,
			campus_country: userdata.campus_country,
		});
	}
}