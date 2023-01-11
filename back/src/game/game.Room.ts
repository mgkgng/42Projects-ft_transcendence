import { Puck } from "./game.Puck";
import {ErrorMessage, uid, UserState} from "./game.utils"
import { DataSource } from "typeorm";
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.service";
import { UserService } from "src/user/user.service";
import { MapSize, PaddleSize, PuckSpeed } from "./game.utils";
import { Client } from "./game.Client";
import { Player } from "./game.Player";
import { GameGateway } from "./game.gateway";

export class Room {
	/* RoomInfo */
	id: string;
	gameInfo: any;
	hostname: string;

	/* RoomState */
	isPrivate: boolean;
	isAvailable: boolean;
	isReady: boolean;
	isStarted: boolean;
	isOver: boolean;

	/* Game */
	puck: Puck;

	/* Users */
	players: Map<string, Player>;
	playerIndex: Array<string>;
	clients: Map<string, Client>;

	/* Server */
	gameServer: GameGateway;
		
	constructor(playersInfo: Array<any>, clients: Array<any>, gameInfo: any, hostname: string = "",
		gameServer: GameGateway, // TODO is it the best way to use it?
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
		this.isStarted = !(hostname.length > 0);
		this.isPrivate = gameInfo.privateMode;
		this.isOver = false;

		/* Game */
		this.puck = undefined;
		
		/* Users */
		this.players = new Map();
		this.clients = new Map<string, Client>();
		this.playerIndex = [playersInfo[0].username_42, (playersInfo.length > 1) ? playersInfo[1].username_42 : undefined];
		this.players.set(playersInfo[0].username_42, new Player(playersInfo[0], (hostname == playersInfo[0].usename_42), 0, MapSize[gameInfo.mapSize], PaddleSize[gameInfo.paddleSize]));
		if (playersInfo.length > 1)
			this.players.set(playersInfo[1].username_42, new Player(playersInfo[1], (hostname == playersInfo[1].usename_42), 1, MapSize[gameInfo.mapSize], PaddleSize[gameInfo.paddleSize]));
		this.addClients(clients);

		/* Server */
		this.gameServer = gameServer;

		// Start game if it is a random match
		if (!this.hostname)
			this.startPong();
	}

	broadcast(event: string, data: any) {
		for (let client of this.clients.values())
			client.broadcast(event, data);
	}

	addClient(client: Client) { this.clients.set(client.username, client); }
	removeClient(client: any) { this.clients.delete(client.username); }

	addClients(clients: Array<Client>) {
		for (let client of clients)
			this.addClient(client);
	}

	deleteClient(client: Client) {
		this.clients.delete(client.username);
		this.players.delete(client.username);
		client.isAvailable();
	}

	playerJoin(playerInfo: any, client: Client) {
		let index = (this.playerIndex[0]) ? 1 : 0;
		this.players.set(client.username, new Player(playerInfo, false, index, MapSize[this.gameInfo.mapSize], PaddleSize[this.gameInfo.paddleSize]));
		this.playerIndex[index] = client.username;
		this.addClient(client);
		this.isAvailable = false;
		client.broadcast("JoinRoomRes", {
			allowed: true,
			roomID: this.id
		});
	}

	playerExit(client: Client) {
		if (this.isStarted) { // If the game has begun, end the game
			// console.log("test: ", this.players, this.players.keys());
			this.endGame(this.players.keys()[0]); //TODO check if it works well tomorrow
			// TODO tomorrow player 
			return ;
		} 

		// get rid of the user from the room
		this.deleteClient(client);
		if (!this.players.size) { // If no more user left in the room, broadcast watchers and destroy the room
			this.broadcast("RoomAlert", ErrorMessage.RoomDestroyed);
			this.destroyRoom();
			return ;
		} else if (this.hostname.length && client.username == this.hostname) { // If the user who just quitted was a host, change the host and make room available again
			// console.log(this.players);
			this.hostname = this.players.get(this.players.keys().next().value).username;
			this.isAvailable = true;
		}
		// Player index update
		if (client.username == this.playerIndex[0])
			this.playerIndex[0] = undefined;
		else
			this.playerIndex[1] = undefined;
		// Broadcast
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
		// Create the puck and broadcast its information
		room.puck = new Puck(MapSize[room.gameInfo.mapSize], PuckSpeed[room.gameInfo.puckSpeed]);
		room.broadcast("LoadBall", {
			vec: room.puck.vec,
			pos: room.puck.pos,
		});
		
		setTimeout(() => {
			room.broadcast("PongStart");
			room.puck.setCheckPuck(room);
		}, 2000);
	}

	startPong() { setTimeout(Room.startPong, 1000, this); }

	endGame(winner: any) {
		this.isOver = true;
		this.broadcast("GameFinished", winner);
		this.storeGame();

		// make every client in the room available
		for (let client of this.clients.values())
			client.isAvailable();

		this.destroyRoom(); // TODO check
	}

	async storeGame() {
		const id_player1 : any = await this.mainServerService.getIdUserByUsername(this.players.get(this.playerIndex[0]).username);
		const id_player2 : any = await this.mainServerService.getIdUserByUsername(this.players.get(this.playerIndex[1]).username);
		const res_user_chat_room = await this.dataSource.createQueryBuilder().insert().into(GameEntity).values
			([ 
				{ player1: id_player1, player2: id_player2, is_finished: true, player1_score: this.players.get(this.playerIndex[0]).score, player2_score: this.players.get(this.playerIndex[1]).score, date_game: new Date() }
			]).execute();
	}

	destroyRoom() {
		// make every client in the room available
		for (let client of this.clients.values())
			client.isAvailable();
	
		this.gameServer.rooms.delete(this.id);
	}
}