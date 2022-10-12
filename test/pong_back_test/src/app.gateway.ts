import { 
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer 
} from "@nestjs/websockets";
import { Server } from 'ws';

function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	return (Array(16).map(x => set[Math.random() * set.length]).join(''));
}

class Client {
	id: string;
	sock: any;
	callbacksOnConnection: Set<Function>;
	listeners: Map<string, Function>;

	//Websocket
	// addEventListener
	// removeEventListener
	constructor(sock: any) {
		this.id = uid();
		this.sock = sock;
		this.listeners = new Map();
		
		this.sock.onmessage = (msg: any) => {
			console.log("receving something", msg);
			this.listeners.get(msg.event)?.(msg.data);
		}
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

class Ball {
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
	ball: Ball;

	constructor() {
		this.gameMap = new GameMap();
		this.ball = new Ball(this.gameMap.width, this.gameMap.height);
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
	constructor(clients, maxpoint: number = 20) {
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
		Server.broadcast(this.getClients(), msg);
	}

	addClients(clients) {
		for (let client of clients)
			this.addClient(client);
	}

	addClient(client: any) {
		this.clients.set(client.id, client);
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
		return ([...this.clients.values()]);
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
	queue: Array<Client>;
	rooms: Array<Room>;

	constructor() {
		this.clients = new Map<string, Client>();
		this.queue = [];
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
	handleConnexion(client): void {
		// console.log("test", client);
		let connection = new Client(client);
		this.clients.set(connection.id, connection);
		
		connection.sock.send(JSON.stringify({
			event: "resTest"
		}))
		// console.log(data.id, 'Connected');
		// this.clients.set(data.id, data);
	}

	@SubscribeMessage("Test")
	test(client: any) {
		console.log("test received!");
		client.send(JSON.stringify({
			event: "resTest"
		}))
	}

	@SubscribeMessage("JoinQueue")
	joinQueue(client: any) {
		console.log("Join Queue");
		this.queue.push(client);
		console.log(this.queue.length);

		if (this.queue.length > 1) {
			let room = new Room([this.queue[0], this.queue[1]]);
			this.queue[0].sock.send(JSON.stringify({
				event: 'MatchFound',
				data: room.id
			}));
			this.queue.slice(2);
		}
	}

}