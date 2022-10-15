import {Pong} from "./game.Pong"
import {GameGateway} from "./game.gateway"
import {uid} from "./game.utils"

export class Room {
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
		this.id = uid();
		//this.chat = new ChatRoomService();
		this.clients = new Map();
		
		this.addClients(clients);

		this.pong = new Pong();
		
		this.players = [clients[0], clients[1]];

		this.maxpoint = maxpoint;
		
		this.scores = [0 , 0];
		
		this.isPlaying = false;

		setTimeout(Room.startPong, 2000, this);
	}

	/**
	 * Use the static server method to broadcast,
	 * pass the clients as parameters
	 */
	broadcast(msg: any) {
		GameGateway.broadcast(this.getClients(), msg);
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