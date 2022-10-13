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

const WsMessage = {
	
}

function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	let res: string = "";
	for (let i = 0; i < 16; i++)
		res += set[Math.floor(Math.random() * set.length)];
	return (res);
}

class Client {
	id: string;
	sock: any;
	callbacksOnConnection: Set<Function>;
	listeners: Map<string, Function>;

	//Websocket
	// addEventListener
	// removeEventListener
	constructor(id: string, sock: any) {
		this.id = id;
		this.sock = sock;
		this.listeners = new Map();
		
		// this.sock.onmessage = (msg: any) => {
		// 	console.log("receving something", msg);
		// 	this.listeners.get(msg.event)?.(msg.data);
		// }
	}

	onDisconnect(callback: Function) {
		this.sock.addListener('close', callback);
	}
	
	addListener(type: string, callback: Function) {
		this.listeners.set(type, callback);
	}

	removeListener(type: string) {
		this.listeners.delete(type);
	}

	send(data: any) {
		if (this?.sock?.readyState === WebSocket.OPEN) // TODO websocket is not defined
		{
			//console.log('send data = ', data);
			try {
				this?.sock?.send?.(JSON.stringify(data));
			} catch (e) {
				console.trace('Error: [send]', data, e);
			}
			return ;
		}
		// this.queue.push(data);
	}


}
const PaddleSize = {
	XSmall: 20,
	Small : 40,
	Medium : 80,
	Large : 130
}

const MapWidth = {
	Small: 400,
	Medium: 700,
	Large: 1000
}

const MapHeight = {
	Small: 600,
	Medium: 800,
	Large: 1000
}

interface moveInfo {
	move: boolean,
	vectorX: number,
	vectorY: number,
	moveWidth: number,
	moveHeight: number
}

class Block {
	startX : number;
	startY: number;
	endX : number;
	endY : number;
	gameWidth: number;
	gameHeight: number;
	moveInfo: moveInfo;

	constructor(startX: number, startY: number, endX: number, endY: number, 
		gameWidth: number, gameHeight: number, moveInfo: moveInfo) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.moveInfo = moveInfo;
	}

	move() {
		
	}
}

class Puck {
	posX: number;
	posY: number;
	vectorX: number;
	vectorY: number;
	gameWidth: number;
	gameHeight: number;

	constructor(gameWidth : number, gameHeight : number, vectorX : number = 1, vectorY : number = 1) {
		this.vectorX = vectorX;
		this.vectorY = vectorY;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.posX = gameWidth / 2;
		this.posY = gameHeight / 2;
	}

	// this is the callBack function 
	move() {
		this.posX += this.vectorX;
		this.posY += this.vectorY;

		//* here should check if it hits any wall */

		//* then here we should find the vector value */
	}

	getHit(vectorX: number, vectorY: number) {
		this.vectorX = vectorX;
		this.vectorY = vectorY;
	}
}

class GameMap {

	blocks : Array<Block>;
	width: number;
	height: number;
	paddleSize: number;

	constructor(mapWidth: number = MapWidth.Medium,
		mapHeight: number = MapHeight.Medium,
		paddleSize: number = PaddleSize.Medium,
		blocks: Array<Block> = []) {
		this.width = mapWidth;
		this.height = mapHeight;
		this.paddleSize = paddleSize;
		this.blocks = blocks;
	}
}

class Pong {
	gameMap: GameMap;
	puck: Puck;
	paddlePos: Array<number>;
	moveMin: number;
	moveMax: number;

	constructor() {
		this.gameMap = new GameMap();
		this.puck = new Puck(this.gameMap.width, this.gameMap.height);

		let initPos = (this.gameMap.width - this.gameMap.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];

		this.moveMin = 0;
		this.moveMax = this.gameMap.width - this.gameMap.paddleSize;
	}

	movePaddle(userIndex: number, left: boolean) {
		if (this.paddlePos[userIndex] == this.moveMin || this.paddlePos[userIndex] == this.moveMax)
			return ;
		this.paddlePos[userIndex] += (left) ? -1 : 1;
	}
}

class Room {
	id: string;
	clients: Map<string, any>;
	players: Array<any>;
	scores: Array<number>;
	maxpoint: number;
	pong: Pong;
	//chat: ChatRoomService
	isPlaying: boolean;
	
	// constructor(clients, mapchoice: string, mode: string, maxpoint: number) {
	constructor(clients: any, maxpoint: number = 20) {
		console.log("constructor: ", clients.length);
		this.id = uid();
		//this.chat = new ChatRoomService();
		this.clients = new Map();
		
		this.addClients(clients);

		this.pong = new Pong();
		
		this.players = [clients[0], clients[1]];

		this.maxpoint = maxpoint;
		
		this.scores = [0 , 0];
		
		this.isPlaying = false;
	}

	/**
	 * Use the static server method to broadcast,
	 * pass the clients as parameters
	 */
	broadcast(msg: any) {
		AppGateway.broadcast(this.getClients(), msg);
	}

	addClients(clients: any) {
		console.log("addClientS: ", clients.length);
		for (let client of clients)
			this.addClient(client);
		console.log("after addClientS: ", this.clients.size);
	}

	addClient(client: any) {
		console.log("addClient", client);
		this.clients.set(client.id, client);
		// this.clients[client.id] = client;
		//this.chat.append_user_to_room();
		//console.log('Room -> addClient', this.clients.size);
		/* IMPORTANT TO REMOVE THE CLIENT */
		// client.onDisconnect(() => this.removeClient(client));
	}

	removeClient(client) {
		this.clients.delete(client.username);
		// this.chat.removeClient(client);
		// console.log('Room -> removeClient', this.clients.size);
	}

	getClients() {
		// console.log(this.clients);
		// console.log("============");
		// console.log([...this.clients.values()]);
		console.log("getClients: ", this.clients.size);
		return (Array.from(this.clients.values()));
	}

	putScore(winner, reason) {

		// Broadcast result
		this.broadcast({
		});

		// Store the game in db
		//this.storeGame();

		// Destroy room
		//this.onEnd?.();
	}

	// async storeGame() {
	// 	// Store the game result in db
	// }
}

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

	async handleConnection(client: any) {
		console.log("New Connection on site.");
		// let connection = new Client(client.sock);
		// this.clients.set(connection.id, connection);
	}

	async handleDisconnect(client: any) {
		console.log("Disconnect.")
		this.clients.delete(client.id);
	}

	@SubscribeMessage("Connexion")
	handleConnexion(client: any, data: any) {
		// console.log("test", client);
		console.log("data", data);
		let connection = new Client(data, client);
		this.clients.set(connection.id, connection);
		
		connection.sock.send(JSON.stringify({
			event: "resTest"
		}))
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

		client.sock.send(JSON.stringify({
			event: "RoomInfo",
			data: {
				res: (room) ? true : false,
				roomInfo: (room) ? {
					players: [room.players[0].id, room.players[1].id],
					maxpoint: room.maxpoint,
					scores: room.scores
				} : undefined
			}
		}));
	}

	@SubscribeMessage("PaddleMove")
	paddleMove(@MessageBody() data: any) {
		console.log("PaddleMove", data);

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
		// calcul algorithm launched here

		console.log("PaddleStop==================================", data);
		clearInterval(this.control.get(data));
		this.control.delete(data);
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

	paddleUpdate(room: any) {
		room.broadcast({
			event: "PaddleUpdate"
		});
	}
}