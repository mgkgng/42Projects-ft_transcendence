import {Pong} from "./game.Pong"
import {GameGateway} from "./game.gateway"
import {uid} from "./game.utils"
import { DataSource } from "typeorm";
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.gateway";

const Difficulty = {
	0 : 3,
	1 : 5,
	2 : 8,
	3 : 15
}

export class Room {
	/* RoomInfo */
	id: string;
	title: string;
	maxpoint: number;
	difficulty: number;

	/* RoomState */
	privateMode: boolean;
	available: boolean;

	/* RoomGame */
	pong: Pong;
	players: Array<any>;
	scores: Array<number>;

	/* RoomConnection */
	clients: Map<string, any>;
	//chat: ChatRoomService
		
	constructor(players: any, title:string, maxpoint: number = 25,
				difficulty : number = 8, privateMode : boolean = true,
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>, 
				private mainServerService : MainServerService,
				private dataSource : DataSource) {
		
		this.id = uid();
		this.title = title;
		this.maxpoint = maxpoint;
		this.difficulty = Difficulty[difficulty];

		this.privateMode = privateMode;

		this.available = (players.length < 2) ? true : false;
	
		this.clients = new Map();
		this.addClients(players);

		this.pong = new Pong(this.difficulty);
		this.players = players;

		// TODO HOST-GUEST MODE / RANDOM MODE
		// if (randomMode)
			// this.startPong();
		
	}
	/**
	 * Use the static server method to broadcast,
	 * pass the clients as parameters
	 */
	broadcast(msg: any) { GameGateway.broadcast(this.getClients(), msg); }

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

	removeClient(client: any) { this.clients.delete(client.username); }

	getClients() { return (Array.from(this.clients.values())); }

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

	startPong() { setTimeout(Room.startPong, 2000, this); }

	putScore() {

		// Broadcast let user = new UserEntity;
		// Store the game in db
		try {
			this.storeGame();
		} 
		catch(e) {
			
		}
		// Destroy room
		//this.onEnd?.();
	}

	async storeGame() {
	 	// Store the game result in db
		const id_player1 : any = await this.mainServerService.getIdUserByUsername(this.clients[0].username);
		const id_player2 : any = await this.mainServerService.getIdUserByUsername(this.clients[1].username);
		const res_user_chat_room = await this.dataSource.createQueryBuilder().insert().into(GameEntity).values
			([ 
				{ player1: id_player1, player2: id_player2, is_finished: true, player1_score: this.scores[0], player2_score: this.scores[1],}
			]).execute();
	}
}