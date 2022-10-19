import {Pong} from "./app.Pong"
import {AppGateway} from "./app.gateway"
import {uid} from "./app.utils"

const Difficulty = {
	0 : 3,
	1 : 5,
	2 : 8,
	3 : 15
}

export class Room {
	id: string;
	clients: Map<string, any>;
	players: Array<any>;
	scores: Array<number>;
	maxpoint: number;
	difficulty: number
	pong: Pong;
	//chat: ChatRoomService
	isPlaying: boolean;
	privateMode: boolean;
	
	// constructor(clients, mapchoice: string, mode: string, maxpoint: number) {
	constructor(clients: any,
		maxpoint: number = 5,
		difficulty: number = 1,
		privateMode: boolean = false) {
		this.id = uid();
		//this.chat = new ChatRoomService();
		this.clients = new Map();
		
		this.addClients(clients);

		this.difficulty = Difficulty[difficulty];
		this.privateMode = privateMode;

		this.pong = new Pong(this.difficulty);
		
		this.players = clients;

		this.maxpoint = maxpoint;
		this.scores = [0 , 0];
		
		// later isPlayer condition could be more developped
		this.isPlaying = false;
		if (this.players.length == 2) {
			this.isPlaying = true;
			setTimeout(Room.startPong, 2000, this);
		}
	}

	/**
	 * Use the static server method to broadcast,
	 * pass the clients as parameters
	 */
	broadcast(msg: any) {
		AppGateway.broadcast(this.getClients(), msg);
	}

	addClients(clients: any) {
		for (let client of clients)
			this.addClient(client);
	}

	addClient(client: any) {
		this.clients.set(client.id, client);
		// this.clients[client.id] = client;
		//this.chat.append_user_to_room();
		//console.log('Room -> addClient', this.clients.size);
		/* TODO IMPORTANT TO REMOVE THE CLIENT */
		// client.onDisconnect(() => this.removeClient(client));
	}

	removeClient(client: any) {
		this.clients.delete(client.username);
	}

	getClients() {
		return (Array.from(this.clients.values()));
	}

	// need static because used often with setTimeOut() func
	// sent by setTimeOut(), 'this' is initialised by timeOut class
	static startPong(room: any) {
		if (!room)
			return ;

		room.broadcast(JSON.stringify({
			event: "LoadBall",
			data: {
				vectorX: room.pong.puck.vectorX,
				vectorY: room.pong.puck.vectorY,
				posX: room.pong.puck.posX,
				posY: room.pong.puck.posY
			}
		}));
		
		setTimeout(() => {
			room.broadcast(JSON.stringify({
				event: "PongStart"
			}))
			room.pong.puck.setCheckPuck(room);
		}, 2000);
	}

	putScore() {

		// Broadcast result

		// Store the game in db
		//this.storeGame();

		// Destroy room
		//this.onEnd?.();
	}

	// async storeGame() {
	// 	// Store the game result in db
	// }
}