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

//TODO Too many connections for a client
//TODO if the client websocket contains request, handshake..

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
	queue: Array<any>;

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
	}

	@WebSocketServer()
	server: Server;

	public handleConnection(client: any, ...args: any[]): void {
		console.log("Connection!!", client.id);

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

		// Get rid of socket from the client instance
		let target = this.getClient(client);
		target.sockets.delete(client.id);

		// destory the instance if the client is no more connected
		if (!target.sockets.size)
			this.clients.delete(target.username);
    }

	@SubscribeMessage("JoinQueue")
	async joinQueue(@ConnectedSocket() client: Socket, @Request() req) {

		// Check if client is available
		let target = this.getClient(req);
		if (target.state != UserState.Available) {
			client.emit("JoinQueueError", (target.state == UserState.Waiting) ? ErrorMessage.AlreadyJoined : ErrorMessage.NotAvailble);
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
			room.broadcast("MatchFound", room.id);
		}
	}

	@SubscribeMessage("LeaveQueue")
	leaveQueue(@Request() req) {
		// Check if the target is effectively waiting for the game
		let target = this.getClient(req);
		if (target.state != UserState.Waiting)
			return ;

		// Get rid of the client from the queue and turn them back available
		let index = this.queue.findIndex(x => x[0] == target.username);
		this.queue.splice(index, 1);
		target.state = UserState.Available;
	}

	@SubscribeMessage("RoomCheck")
	roomCheck(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check if the room exists and if room contains the user as client
		let target = this.getClient(req);
		let room = this.getRoom(data.room);
		if (!room) {
			client.emit("RoomCheckError", ErrorMessage.RoomNotFound);
			return ;
		} else if (!room.clients.has(target.username)) {
			client.emit("RoomCheckError", ErrorMessage.AccessNotPermitted);
			return ;
		}

		// Give the user the room information
		target.broadcast("RoomFound", {
			roomHost: room.hostname,
			players: room.players,
			maxpoint: room.maxpoint,
			scores: room.scores,
			mapSize: [room.pong.size[0], room.pong.size[1]],
			paddleSize: room.pong.paddleSize
		});
	}

	@SubscribeMessage("PaddleMoveKey")
	paddleMove(@MessageBody() data: any, @Request() req) {
		// Check if the request came from a proper player
		let target = this.getClient(req);
		let room = this.getRoom(data.room);

		// Paddle starts to move, Websocket Messages set with interval
		let intervalId = setInterval(() => {
			room.pong.movePaddle(data.player, data.left);
			room.broadcast("PaddleUpdate", {
				player: data.player,
				paddlePos: room.pong.paddlePos[data.player]
			});
		}, 20);
		room.keyControl.set(data.client, intervalId);
	}

	@SubscribeMessage("PaddleStop")
	paddleStop(@MessageBody() data: any, @Request() req) {
		clearInterval(this.keyControl.get(data));
		this.keyControl.delete(data);
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
	async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check whether the room exists and whether the room is available if the user wants to play
		let target = this.getClient(req);
		let room = this.getRoom(data.roomId);
		if (!room) {
			client.emit("JoinRoomError", ErrorMessage.RoomNotFound);
			return ;
		} else if (room.players.size > 1 && data.play) {
			client.emit("JoinRoomError", ErrorMessage.RoomNotAvailble);
			return ;
		}
		
		// If the user wants to play
		if (data.play) {
			// broadcast to the users in the room that there is a new player then add player in the room
			const newPlayer = await this.getPlayerInfo(target.username);
			room.broadcast("PlayerUpdate", newPlayer);
			target.state = UserState.Playing;
			room.playerJoin(newPlayer, target);
		} else {
			// If the user only wants to watch, add the user in the client list
			target.state = UserState.Watching;
			room.addClient(target);
		}

		// tell either the player or the watcher that they can join the room
		target.broadcast("JoinRoomRes", data.roomId);
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