import { 
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer
} from "@nestjs/websockets";
import { runInThisContext } from "vm";
import { threadId } from "worker_threads";
import { Server, Socket } from "socket.io";
import {Client} from './game.Client'
import {Block} from "./game.Block"
import {Puck} from "./game.Puck"
import {Room} from "./game.Room"
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { UserBlockEntity } from "src/entity/UserBlock.entity";
import { MainServerService } from "src/mainServer/mainServer.gateway";
import { JwtService } from '@nestjs/jwt';
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { replacer } from "./game.utils";

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
//export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
export class GameGateway {
	clients: Map<string, Client>;
	rooms: Map<string, Room>;
	queue: Array<Client>;
	control: Map<string, any>;

	constructor(private mainServerService : MainServerService, private jwtService: JwtService, 
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>,
				private dataSource : DataSource,
	) {
		this.clients = new Map<string, Client>();
		this.rooms = new Map<string, Room>();
		this.queue = [];
		this.control = new Map<string, any>();

		// Testing rooms
		this.addRoomsForTest();
	}

	@WebSocketServer()
	server: Server;

	addRoomsForTest() {
		let room1 = new Room(['testPlayer1'], 'TestRoom1', 25, 5, false,
			this.gameRep, this.mainServerService, this.dataSource);

		let room2 = new Room(['testPlayer2'], "Welcome to this map", 18, 3, false,
			this.gameRep, this.mainServerService, this.dataSource);
	
		this.rooms.set(room1.id, room1);
		this.rooms.set(room2.id, room2);
		console.log(this.rooms);
	}


	@UseGuards(AuthGuard("jwt"))
	async handleConnection(client: Socket) { //TODO handle connection here
		// console.log("New Connection on site.");
		// i don't know yet how to use well this function
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) { //TODO handle connection here
		console.log("Disconnection...", client.id);
		this.clients.delete(client.id);

	}

	@SubscribeMessage("Connection")
	handleConnexion(@ConnectedSocket() client: Socket, @Request() req) {
		console.log("Connection!!");
		// console.log("data", req);
		const user: any = (this.jwtService.decode(req.handshake.headers.authorization.split(' ')[1]));
		// console.log(user);
		let newClient = new Client(client, user.username);
		this.clients.set(newClient.id, newClient);

		// console.log(this.clients.keys());

		// console.log("or with socketio", this.server.sockets.sockets);
		console.log(client.id);
		// Should send it only once
		client.emit("GetConnectionInfo", {
			id: newClient.id,
			user: {
				username: user.username
			}
		})
		console.log("how many: ", this.server.sockets.sockets.keys());
		console.log("=================================");

		// Here maybe should be db check - if user is already registered.
	}

	@SubscribeMessage("JoinQueue")
	joinQueue(@MessageBody() data: any) {
		console.log("Join Queue", data.data);
		let client = this.getClient(data.data);
		//TODO: should maybe optimize the algorithm later -- for includes
		if (client && (client.room.length || this.queue.includes(client)))
			return ;

		this.queue.push(client);

		if (this.queue.length > 1) {
			let room = new Room([this.queue[0], this.queue[1]], "test", 25, 8, true, this.gameRep, this.mainServerService, this.dataSource);
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
			players: (room.players.length === 2) ? [room.players[0].id, room.players[1].id]
				: [room.players[0].id],
			maxpoint: room.maxpoint,
			scores: room.scores,
			mapSize: [room.pong.gameMap.width, room.pong.gameMap.height],
			paddleSize: room.pong.gameMap.paddleSize
		});

	}

	@SubscribeMessage("PaddleMove")
	paddleMove(@MessageBody() data: any) {
		// console.log("PaddleMove", data);

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
	askRooms(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		console.log("AskRooms");
		// let client = this.server.sockets.sockets.get(sock.id);
		// console.log("hahaha: ", sock.id);
		// console.log("=================================");
		// console.log("YOYOYOYOYOYO: ", this.server.sockets.sockets.get(sock.id));
	
		// I need to think more about how i should save the data and how i'll send it
		// there should be at least these information:
		// playersInfo, availability / format (max point, map, mode...)
		// and then if the game is going on...
		// score...
		
		console.log();

		client.emit("GetAllRooms", {
			rooms: JSON.stringify([...this.rooms].filter(room => !room[1].privateMode), replacer())
		});
	}

	@SubscribeMessage("CreateRoom")
	createRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
		console.log("CreateRoom", data);
		
		// TODO should be able to have client's room state
		// if (client.room.length)
		// 	return ;

		let room = new Room([client], data.title, data.maxPoint, data.difficulty, data.privateMode, this.gameRep, this.mainServerService, this.dataSource);
		this.rooms.set(room.id, room);
		
		// TODO should be able to set client's room state
		// client.room = room.id;

		client.emit("RoomCreated", room.id);
	}

	static broadcast(clients: any, event: string, data: any) {
		for (let client of clients)
			client.socket.emit(event, data);
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

	getClient(id: string) { return (this.clients.get(id)); }
	getRoom(id: string) { return (this.rooms.get(id)); }
}