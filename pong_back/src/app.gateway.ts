import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "ws";
import { Socket } from 'socket.io';

class Client
{
	username : string;
	sock : Socket;
	// constructor(socket_client : Socket, username : string)
	constructor()
	{
		this.username = username;
		this.sock = socket_client;
	}
};

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

@WebSocketGateway(3000)
export class AppGateway {
	clients: Map<string, Client>

	constructor() {
		this.clients = new Map<string, Client>();
	}

	@WebSocketServer()
	server: Server;

	handleConnection(client: any) {
		if (this.clients.has(client.id))
			this.clients.set(client)


	}

	@SubscribeMessage("Connexion")
	handleMessage(client: any, )

	
}