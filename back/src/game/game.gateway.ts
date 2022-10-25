import { 
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer,
	ConnectedSocket
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
	}

	@WebSocketServer()
	server: Server;

	@UseGuards(AuthGuard("jwt"))
	async handleConnection(client: Socket) { //TODO handle connection here
		// console.log("New Connection on site.");
		// i don't know yet how to use well this function
	}

	async handleDisconnect(client: Socket) { //TODO handle connection here
		console.log("Disconnect.")
		this.clients.delete(client.id);
	}

	@SubscribeMessage("Connection")
	handleConnexion(@ConnectedSocket() client: Socket, @Request() req) {
		// console.log("Connection received", client);
		const user: any = (this.jwtService.decode(req.handshake.headers.authorization.split(' ')[1]));
		// console.log(user);
		let newClient = new Client(client, user.username);
		this.clients.set(newClient.id, newClient);

		// Should send it only once
		client.emit("GetConnectionInfo", {
			id: newClient.id,
			user: {
				username: user.username
			}
		})
		// Here maybe should be db check - if user is already registered.
	}

	@SubscribeMessage("JoinQueue")
	joinQueue(@MessageBody() data: any) {
		console.log("Join Queue", data);
		let client = this.getClient(data);
		// TODO: should maybe optimize the algorithm later -- for includes
		if (client.room.length || this.queue.includes(client))
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
	roomCheck(@MessageBody() data: any) {
		console.log("RoomCheck", data);

		let client = this.getClient(data.client);
		let room = this.getRoom(data.room);

		if (!room) {
			client.socket.emit("RoomNotFound");
			return ;
		}

		client.socket.emit("RoomInfo", {
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
	askRooms(@MessageBody() data: any) {
		let client = this.getClient(data);
	
		// I need to think more about how i should save the data and how i'll send it
		// there should be at least these information:
		// playersInfo, availability / format (max point, map, mode...)
		// and then if the game is going on...
		// score...
		
		client.socket.emit("GetAllRooms", {
			rooms: [...this.rooms].filter(room => room[1].privateMode == false)
		});
	}

	@SubscribeMessage("CreateRoom")
	createRoom(@MessageBody() data: any) {
		let client = this.getClient(data.client);
		if (client.room.length)
			return ;

		let room = new Room([client], data.title, data.maxPoint, data.difficulty, data.privateMode, this.gameRep, this.mainServerService, this.dataSource);
		this.rooms.set(room.id, room);
		client.room = room.id;

		client.socket.emit("RoomCreated", room.id);
	}

	static broadcast(clients: any, event: string, data: any) {
		for (let client of clients)
			client.socket.emit(event, data);
	}

	getClient(id: string) { return (this.clients.get(id)); }
	getRoom(id: string) { return (this.rooms.get(id)); }
}