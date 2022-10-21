import { 
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer 
} from "@nestjs/websockets";
import { Server } from 'ws';
import { Client } from "./app.Client";
import { Room } from "./app.Room";


@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
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
		// TODO: should maybe optimize the algorithm later -- for includes
		if (client.room.length || this.queue.includes(client))
			return ;

		this.queue.push(client);

		if (this.queue.length > 1) {
			// TODO: think about it: if i just join a match randomlmy like this, it could be by default a private game
			let room = new Room([this.queue[0], this.queue[1]], "random match");
			this.queue[0].room = room.id;
			this.queue[1].room = room.id;

			room.broadcast(JSON.stringify({
				event: 'MatchFound',
				data: room.id
			}));

			this.rooms.set(room.id, room);
			this.queue = this.queue.slice(2);
		}

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
					players: (room.players.length === 2) ? [room.players[0].id, room.players[1].id]
						: [room.players[0].id],
					maxpoint: room.maxpoint,
					scores: room.scores,
					mapSize: [room.pong.gameMap.width, room.pong.gameMap.height],
					paddleSize: room.pong.gameMap.paddleSize
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

	@SubscribeMessage("AskRooms")
	askRooms(@MessageBody() data: any) {
		let client = this.getClient(data);
	
		// I need to think more about how i should save the data and how i'll send it
		// there should be at least these information:
		// playersInfo, availability / format (max point, map, mode...)
		// and then if the game is going on...
		// score...
		
		client.sock.send(JSON.stringify({
			event: "GetAllRooms",
			data: [...this.rooms].filter(room => room[1].privateMode == false)
		}));
	}

	@SubscribeMessage("CreateRoom")
	createRoom(@MessageBody() data: any) {
		let client = this.getClient(data.client);
		if (client.room.length)
			return ;

		let room = new Room([client], data.title, data.maxPoint, data.difficulty, data.privateMode);
		this.rooms.set(room.id, room);
		client.room = room.id;

		client.sock.send(JSON.stringify({
			event: "RoomCreated",
			data: room.id
		}));
	}

	@SubscribeMessage("AskVerifyJWT")
	async verifyJWT(@MessageBody() data: any) {
		let client = this.getClient(data.client); // TODO automize it
		client.user = await askVerifyJWT(client, data.jwt);
	}





	static broadcast(clients: any, msg: any) {
		for (let client of clients)
			client.sock.send(msg);
	}

	getClient(id: string) {
		return (this.clients.get(id));
	}

	getRoom(id: string) {
		return (this.rooms.get(id));
	}
}