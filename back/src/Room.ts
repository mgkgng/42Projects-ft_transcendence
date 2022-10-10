import { ChatRoomService } from "./chatRoom/chatRoom.gatway";
import { Client } from "./Client"
import { MainServerService } from "./mainServer/mainServer.gateway";
import { Pong } from "./pong/Pong";
import { uid } from "./uid";

interface GameMode {
	// basic mode, serve mode ... difficult mode, easy mode...
}

interface MapChoice {

}

export class Room {
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
		MainServerService.broadcast(this.getClients(), msg);
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