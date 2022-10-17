import { 
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer 
} from "@nestjs/websockets";
import { runInThisContext } from "vm";
import { threadId } from "worker_threads";
import { Server } from 'ws';
import {Client} from './game.Client'
import {Block} from "./game.Block"
import {Puck} from "./game.Puck"
import {Room} from "./game.Room"
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
	

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

	constructor() {
		this.clients = new Map<string, Client>();
		this.rooms = new Map<string, Room>();
		this.queue = [];
		this.control = new Map<string, any>();
	}

	@WebSocketServer()
	server: Server;

	async handleConnection(client: any) { //TODO handle connection here
		console.log("New Connection on site.");
		// let connection = new Client(client.sock);
		// this.clients.set(connection.id, connection);
	}

	async handleDisconnect(client: any) { //TODO handle connection here
		console.log("Disconnect.")
		this.clients.delete(client.id);
	}

	@SubscribeMessage("Connexion")
	handleConnexion(client: any, data: any) {
		// console.log("test", client);
		console.log("data", data);
		let connection = new Client(data, client);
		this.clients.set(connection.id, connection);
	}

	@SubscribeMessage("JoinQueue")
	joinQueue(@MessageBody() data: any) {
		console.log("Join Queue", data);
		let client = this.getClient(data);

		if (this.queue.includes(client)) {
			// TODO: should optimize the algorithm later
			
			console.log("already joined the queue");
			return ;
		}

		this.queue.push(client);
		console.log("Queue length at the beginning: ", this.queue.length);

		if (this.queue.length > 1) {
			let room = new Room([this.queue[0], this.queue[1]]);
			room.broadcast(JSON.stringify({
				event: 'MatchFound',
				data: room.id
			}));
			console.log("sending matchfound.");
			this.rooms.set(room.id, room);
			this.queue = this.queue.slice(2);
		}
		console.log("Queue length at the end: ", this.queue.length);

	}

	@SubscribeMessage("RoomCheck")
	roomCheck(@MessageBody() data: any) {
		console.log("RoomCheck", data);

		let client = this.getClient(data.client);
		let room = this.getRoom(data.room);

		if (!room) {
			client.sock.send(JSON.stringify({
				event: "RoomNotFound"
			}))
			return ;
		}

		client.sock.send(JSON.stringify({
			event: "RoomInfo",
			data: {
				roomInfo: {
					players: [room.players[0].id, room.players[1].id],
					maxpoint: room.maxpoint,
					scores: room.scores,
					mapSize: [room.pong.gameMap.width, room.pong.gameMap.height],
					paddleSize: room.pong.gameMap.paddleSize
				}
			}
		}));

	}

	@SubscribeMessage("PaddleMove")
	paddleMove(@MessageBody() data: any) {
		// console.log("PaddleMove", data);

		let room = this.getRoom(data.room);

		// calcul algorithm launched here

		let intervalId = setInterval(() => {
			room.pong.movePaddle(data.player, data.left);
			room.broadcast(JSON.stringify({
				event: "PaddleUpdate",
				data: {
					player: data.player,
					paddlePos: room.pong.paddlePos[data.player]
				}
			}));
		}, 20);
		this.control.set(data.client, intervalId);
	}

	@SubscribeMessage("PaddleStop")
	paddleStop(@MessageBody() data: any) {
		clearInterval(this.control.get(data));
		this.control.delete(data);
	}

	static broadcast(clients: any, msg: any) {
		for (let client of clients)
			client.sock.send(msg);
	}

	getClient(id: string) { return (this.clients.get(id)); }
	getRoom(id: string) { return (this.rooms.get(id)); }
}