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
import { ErrorMessage, RoomUpdate, UserState } from "./game.utils";

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
//export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	// connections: Map<string, Socket>;
	clients: Map<string, Client>;
	rooms: Map<string, Room>;
	roomlistClients: Array<any>;
	queue: Array<any>;
	control: Map<string, any>;

	constructor(private mainServerService : MainServerService, private jwtService: JwtService, 
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>,
				private dataSource : DataSource,
				private userService : UserService,
				private jwtServer: JwtService
	) {
		// this.connections = new Map<string, Socket>();
		this.clients = new Map<string, Client>();
		this.rooms = new Map<string, Room>();
		this.roomlistClients = [];
		this.queue = [];
		this.control = new Map<string, any>();
	}

	@WebSocketServer()
	server: Server;

	public handleConnection(client: any, ...args: any[]): void {
		console.log("Connection!!", client.id);
		// this.connections.set(client.id, client);

		// Check the user and if the user is already connected.
		let userInfo = this.getUserInfo(client);
		if (this.clients.has(userInfo.username_42))
			this.clients.get(userInfo.username_42).sockets.set(client.id, client);
		else
			this.clients.set(userInfo.username_42, new Client(userInfo.username_42, client));

		// Give user information
		client.emit("GetConnectionInfo", {
			user: {
				username: userInfo.username,
				displayname: userInfo.displayname,
				image_url: userInfo.image_url,
				campus_name: userInfo.campus_name,
				campus_country: userInfo.campus_country
			}
		})
	}

	public handleDisconnect(client: any): void {
		console.log("Disconnection...", client.id);
		// this.connections.delete(client.id);

		let target = this.getClient(client);
		target.sockets.delete(client.id);
		if (!target.sockets.size)
			this.clients.delete(target.username);
    }

	@SubscribeMessage("JoinQueue")
	async joinQueue(@ConnectedSocket() client: Socket, @Request() req) {

		// Protection: if client is available (neither waiting nor playing)
		let target = this.getClient(req);
		if (target.state != UserState.Available) {
			client.emit("JoinQueueRes", {
				allowed: false,
				error: ErrorMessage.JoinQueueError
			});
			return ;
		}

		// Join Queue
		this.queue.push([target.username, target]);
		target.state = UserState.Waiting

		// Game distribution
		if (this.queue.length > 1) {

			// create a room for two players
			let [target1, target2] = [this.getClient(this.queue[0][0]), this.getClient(this.queue[1][0])];
			let [player1, player2] = [this.getPlayerInfo(target1.username), this.getPlayerInfo(target2.username)];
			let room = new Room([player1, player2], [target1, target2], "", "Medium", 10, "Normal", "Normal", true, "", this.gameRep, this.mainServerService, this.dataSource, this.userService);
			this.rooms.set(room.id, room);
		
			// switch their state into playing then get rid of them from the queue
			[target1.state, target2.state] = [UserState.Playing, UserState.Playing];
			this.queue.splice(0, 2);

			// broadcast to let them join the game
			room.broadcast("JoinQueueRes", {
				allowed: true,
				roomId: room.id
			});
		}
	}

	@SubscribeMessage("LeaveQueue")
	leaveQueue(@Request() req) {
		let target = this.getClient(req);

		let index = this.queue.findIndex(x => x[0].username == target.username);
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

	getRoom(id: string) { return (this.rooms.get(id)); }

	getClient(request: any) {
		const user: any = (this.jwtService.decode(request.handshake.headers.authorization.split(' ')[1]));
		return this.clients.get(user.username_42);
	}

	deleteClient(username: any) { this.clients.delete(username); }

	getUserInfo(request: any) {
		const user: any = (this.jwtService.decode(request.handshake.headers.authorization.split(' ')[1]));	
		return user;
	}

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