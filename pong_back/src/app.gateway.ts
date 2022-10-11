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

class Client
{
	username : string;
	sock : WebSocket;
	// constructor(socket_client : Socket, username : string)
	constructor(username: string, sock: WebSocket)
	{
		this.username = username;
		this.sock = sock;
	}
};

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
	clients: Map<string, Client>;
	players: Array<Client>;
	scores: Array<number>;
	maxpoint: number;
	pong: Pong;
	//chat: ChatRoomService
	isPlaying: boolean;
	
	// constructor(clients, mapchoice: string, mode: string, maxpoint: number) {
	constructor(clients, maxpoint: number = 20) {
		this.id = uid();
		//this.chat = new ChatRoomService();
		this.addClients(clients);

		this.pong = new Pong();
		
		this.players[0] = clients[0];
		this.players[1] = clients[1];

		this.maxpoint = maxpoint;
		
		this.scores[0] = 0;
		this.scores[1] = 0;
		
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

	addClient(client) {
		this.clients.set(client.username, client);
		//this.chat.append_user_to_room();
		//console.log('Room -> addClient', this.clients.size);
		client.onDisconnect(() => this.removeClient(client));
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
	clients: Map<string, Client>

	constructor() {
		this.clients = new Map<string, Client>();
	}

	@WebSocketServer()
	server: Server;

	async handleConnection(client: any) {
		console.log("New Connection on site.")
		if (!this.clients.has(client.id))
			this.clients.set(client.id, client);
	}

	async handleDisconnect(client: any) {
		console.log("Disconnect.")
		this.clients.delete(client.id);
	}

	@SubscribeMessage("Connexion")
	handleConnexion(@MessageBody() data: any): void {
		console.log("test", data);
		console.log(data.id, 'Connected');
		this.clients.set(data.id, data);
	}

	@SubscribeMessage("Test")
	test(client: any) {
		console.log("test received!");
		client.send(JSON.stringify({
			event: "resTest"
		}))
	}


}