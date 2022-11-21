import {Pong} from "./game.Pong"
import {GameGateway} from "./game.gateway"
import {ErrorMessage, uid} from "./game.utils"
import { DataSource } from "typeorm";
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.service";
import { UserService } from "src/user/user.service";
import { MapSize, PaddleSize, PuckSpeed } from "./game.utils";
import { Client } from "./game.Client";
import { Player } from "./game.Player";


export class Room {
	/* RoomInfo */
	id: string;
	gameInfo: any;
	title: string;
	size: number;
	maxpoint: number;
	hostname: string;

	/* RoomState */
	isPrivate: boolean;
	isAvailable: boolean;
	isReady: boolean;
	isStarted: boolean;

	/* Game */
	pong: Pong;

	/* Users */
	players: Map<string, Player>;
	clients: Map<string, Client>;
		
	constructor(playersInfo: Array<any>, clients: Array<any>, gameInfo: any, hostname: string = "",
		@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>, 
				private mainServerService : MainServerService,
				private dataSource : DataSource,
				private userService : UserService) {
		/* Room Info */
		this.id = uid();
		this.hostname = hostname;
		this.gameInfo = gameInfo;

		/* Room State */
		this.isAvailable = (playersInfo.length < 2) ? true : false;
		this.isReady = false;
		this.isStarted = false;
		this.isPrivate = gameInfo.privateMode;

		/* Game */
		this.pong = new Pong(MapSize[gameInfo.mapSize], PuckSpeed[gameInfo.puckSpeed], PaddleSize[gameInfo.paddleSize]);
		
		/* Users */
		this.players.set(playersInfo[0].username_42, new Player(playersInfo[0], (hostname == playersInfo[0].usename_42) ? true : false, 0));
		if (playersInfo.length > 1)
			this.players.set(playersInfo[1].username_42, new Player(playersInfo[1], (hostname == playersInfo[1].usename_42) ? true : false, 1));
		this.addClients(clients);

		// Start game if it is a random match
		if (!this.hostname)
			this.startPong();
	}

	broadcast(event: string, data: any) {
		for (let client of this.clients.values())
			client.broadcast(event, data);
	}

	addClient(client: Client) {
		this.clients.set(client.username, client);
	}

	addClients(clients: Array<Client>) {
		for (let client of clients)
			this.addClient(client);
	}

	removeClient(client: any) {
		this.clients.delete(client.username);
	}

	playerJoin(playerInfo: any, client: Client) {
		this.players.set(client.username, new Player(playerInfo, false, 1));
		this.addClient(client);
		this.isAvailable = false;
	}

	playerExit(client: Client) {
		// Remove the user from player and client
		this.clients.delete(client.username);
		this.players.delete(client.username);

		if (this.isStarted) {
			// If the game has begun, end the game
			this.endGame(this.players.values()[0].username); //TODO check if it works well
			return (false);
		} else if (!this.players.size) {
			// If no more user left in the room, broadcast watchers and destroy the room
			this.broadcast("RoomAlert", ErrorMessage.RoomDestroyed);
			return (false);
		} else if (client.username == this.hostname) {
			// If the user who just quitted was a host, change the host and make room available again
			this.hostname = this.players.values()[0].username;
			this.isAvailable = true;
		}
		this.broadcast("PlayerUpdate", {
			join: false,
			username: client.username,
			hostname: this.hostname
		});
		return (true);
	}

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

	endGame(winner: any) {
		this.broadcast("GameResult", winner);
		this.storeGame();
	}

	async storeGame() {
	 	// Store the game result in db
		 const id_player1 : any = await this.mainServerService.getIdUserByUsername(this.players[0].username_42);
		 const id_player2 : any = await this.mainServerService.getIdUserByUsername(this.players[1].username_42);
		 const res_user_chat_room = await this.dataSource.createQueryBuilder().insert().into(GameEntity).values
			([ 
				{ player1: id_player1, player2: id_player2, is_finished: true, player1_score: this.scores[0], player2_score: this.scores[1], date_game: new Date() }
			]).execute();
	}
}