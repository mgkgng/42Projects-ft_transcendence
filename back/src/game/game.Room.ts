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
import { Paddle } from "./game.Paddle";

export class Room {
	/* RoomInfo */
	id: string;
	gameInfo: any;
	hostname: string;
	invited: any;

	/* RoomState */
	isPrivate: boolean;
	isAvailable: boolean;
	isReady: boolean;
	isStarted: boolean;
	isOver: boolean;

	/* Game */
	puck: Puck;
	paddles: Array<Paddle>;

	/* Users */
	players: Map<string, Player>;
	playerIndex: Array<string>;
	clients: Map<string, Client>;
	newWatchers: Map<string, Client>;

	/* Server */
	gameServer: GameGateway;
		
	constructor(playersInfo: Array<any>, clients: Array<any>, gameInfo: any,
		hostname: string = "", invited: any = undefined,
		gameServer: GameGateway,
		@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>, 
				private mainServerService : MainServerService,
				private dataSource : DataSource,
				private userService : UserService) {
		/* Room Info */
		this.id = uid();
		this.hostname = hostname;
		this.invited = invited;
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
		this.paddles = [new Paddle(MapSize[gameInfo.mapSize], PaddleSize[gameInfo.paddleSize]), new Paddle(MapSize[gameInfo.mapSize], PaddleSize[gameInfo.paddleSize])]
		this.clients = new Map<string, Client>();
		this.newWatchers = new Map<string, Client>();
		this.playerIndex = [playersInfo[0].username_42, (playersInfo.length > 1) ? playersInfo[1].username_42 : undefined];
		this.players.set(playersInfo[0].username_42, new Player(playersInfo[0], (hostname == playersInfo[0].usename_42), 0));
		if (playersInfo.length > 1)
			this.players.set(playersInfo[1].username_42, new Player(playersInfo[1], (hostname == playersInfo[1].usename_42), 1));
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

	addClient(client: Client) { this.clients.set(client.username_42, client); }
	removeClient(client: any) { this.clients.delete(client.username_42); }

	addClients(clients: Array<Client>) {
		for (let client of clients)
			this.addClient(client);
	}

	deleteClient(client: Client) {
		this.clients.delete(client.username_42);
		this.players.delete(client.username_42);
		client.isAvailable();
	}

	playerJoin(playerInfo: any, client: Client) {
		let index = (this.playerIndex[0]) ? 1 : 0;
		this.players.set(client.username_42, new Player(playerInfo, false, index));
		this.playerIndex[index] = client.username_42;
		this.addClient(client);
		this.isAvailable = false;
		client.broadcast("JoinRoomRes", {
			allowed: true,
			roomID: this.id,
			mode: 1
		});
	}

	playerExit(client: Client) {
		if (this.isStarted) { // If the game has begun, end the game
			// console.log("test: ", this.players, this.players.keys());
			this.endGame([...this.players.keys()][0]);
			return ;
		} 

		// get rid of the user from the room
		this.deleteClient(client);
		if (!this.players.size) { // If no more user left in the room, broadcast watchers and destroy the room
			this.broadcast("RoomAlert", ErrorMessage.RoomDestroyed);
			this.destroyRoom();
			return ;
		} else if (this.hostname.length && client.username_42 == this.hostname) { // If the user who just quitted was a host, change the host and make room available again
			// console.log(this.players);
			this.hostname = this.players.get(this.players.keys().next().value).username_42;
			this.isAvailable = true;
		}
		// Player index update
		if (client.username_42 == this.playerIndex[0])
			this.playerIndex[0] = undefined;
		else
			this.playerIndex[1] = undefined;
		// Broadcast
		this.broadcast("PlayerUpdate", {
			join: false,
			username_42: client.username_42,
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
			pos: room.puck.pos,
			vec: room.puck.vec,
		});
		if (room.newWatchers.size) {
			let newWatchers = [...room.newWatchers.values()]
			for (let client of newWatchers)
				client.broadcast("showGame", {
					pos: room.puck.pos,		
					vec: room.puck.vec,
					isGoingOn: false
				});
			room.addClients(newWatchers);
			room.newWatchers.clear();
		}

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

		this.destroyRoom();
	}

	async storeGame() {
		try{
			const id_player1 : any = await this.mainServerService.getIdUserByUsername42(this.players.get(this.playerIndex[0]).info.username_42);
			const id_player2 : any = await this.mainServerService.getIdUserByUsername42(this.players.get(this.playerIndex[1]).info.username_42);
			const res_user_chat_room = await this.dataSource.createQueryBuilder().insert().into(GameEntity).values
				([ 
					{ player1: id_player1, player2: id_player2, is_finished: true, player1_score: this.players.get(this.playerIndex[0]).score, player2_score: this.players.get(this.playerIndex[1]).score, date_game: new Date() }
				]).execute();
		}catch(e){
			console.log(e);
		}
	}

	destroyRoom() {
		// make every client in the room available
		for (let client of this.clients.values())
			client.isAvailable();
	
		this.gameServer.rooms.delete(this.id);
	}
}