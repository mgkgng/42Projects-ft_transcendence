import {Pong} from "./game.Pong"
import {GameGateway} from "./game.gateway"
import {uid} from "./game.utils"
import { DataSource } from "typeorm";
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.gateway";
import { UserService } from "src/user/user.service";
import { MapSize, PaddleSize, PuckSpeed } from "./game.utils";


export class Room {
	/* RoomInfo */
	id: string;
	title: string;
	size: number;
	maxpoint: number;
	difficulty: number;
	hostname: string;

	/* RoomState */
	privateMode: boolean;
	available: boolean;
	ready: boolean;

	/* RoomGame */
	pong: Pong;
	players: Array<any>;
	scores: Array<number>;

	/* RoomConnection */
	clients: Map<string, any>;
	chat: Map<string, string>
		
	constructor(players: any, clients: any, title:string, size: number, maxpoint: number = 25,
				puckSpeed : number, paddleSize:number, privateMode : boolean = true, hostname: string = "",
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>, 
				private mainServerService : MainServerService,
				private dataSource : DataSource,
				private userService : UserService) {
		this.id = uid();
		this.title = title;
		this.maxpoint = maxpoint;
		this.hostname = hostname;
		this.scores = [0, 0];

		this.privateMode = privateMode;
		this.available = (players.length < 2) ? true : false;
		this.ready = false;
	
		this.clients = new Map();
		this.addClients(clients);

		this.pong = new Pong(MapSize[size], PuckSpeed[puckSpeed], paddleSize[paddleSize]);
		this.players = players;

		if (!this.hostname.length)
			this.startPong();
	}

	async getPlayerInfo(player: any) {
		console.log("getplayerinfo: ", player);
		const userdata = await this.userService.findOne(player);
		console.log("userdata: ", userdata);
		return ({
			username: userdata.username,
			displayname: userdata.display_name,
			image_url: userdata.img_url,
			campus_name: userdata.campus_name,
			campus_country: userdata.campus_country,
		});
	}

	/**
	 * Use the static server method to broadcast,
	 * pass the clients as parameters
	 */
	broadcast(event: string, data: any) { GameGateway.broadcast(this.getClients(), event, data); }

	addClients(clients: any) {
		for (let client of clients)
		{
			this.addClient(client);
		}
	}

	addMessage(username: string, message: string) {
		this.chat.set(username, message);
		this.broadcast("newChatGameMessage", {username, message});
	}

	addClient(client: any) {
		this.clients.set(client.id, client);
		// this.clients[client.id] = client;
		//this.chat.append_user_to_room();
		//console.log('Room -> addClient', this.clients.size);
		/* TODO IMPORTANT TO REMOVE THE CLIENT */
		// client.onDisconnect(() => this.removeClient(client));
	}

	addPlayer(client: any, player: any) {
		this.players.push(player);
		this.addClient(client);
	}

	removeClient(client: any) { this.clients.delete(client.username); }

	getClients() { return (Array.from(this.clients.values())); }

	// need static because used often with setTimeOut() func
	// sent by setTimeOut(), 'this' is initialised by timeOut class
	static startPong(room: any) {
		if (!room)
			return ;

		room.broadcast("LoadBall", {
			vectorX: room.pong.puck.vectorX,
			vectorY: room.pong.puck.vectorY,
			posX: room.pong.puck.posX,
			posY: room.pong.puck.posY
		});
		
		setTimeout(() => {
			room.broadcast("PongStart", { undefined });
			room.pong.puck.setCheckPuck(room);
		}, 2000);
	}

	startPong() { setTimeout(Room.startPong, 1000, this); }

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