import { 
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway, 
	WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import {Client} from './game.Client'
import {Room} from "./game.Room"
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { UserBlockEntity } from "src/entity/UserBlock.entity";
import { MainServerService } from "src/mainServer/mainServer.service";
import { JwtService } from '@nestjs/jwt';
import { GameEntity } from "src/entity/Game.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { UserService } from "src/user/user.service";
import { ErrorMessage, getRandomInt, MapSize, PaddleSize, RoomUpdate, UserState } from "./game.utils";
import { UserEntity } from "src/entity/User.entity";
//TODO Too many connections for a client
//TODO if the client websocket contains request, handshake..
//TODO put username_42 inside of client and replace everything with it

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
//export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	clients: Map<string, Client>;
	rooms: Map<string, Room>;
	queue: Array<any>;

	constructor(private mainServerService : MainServerService, private jwtService: JwtService, 
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>,
				private dataSource : DataSource,
				private userService : UserService,
				private jwtServer: JwtService
	) {
		this.clients = new Map<string, Client>();
		this.rooms = new Map<string, Room>();
		this.queue = [];
	}

	@WebSocketServer()
	server: Server;

	public async handleConnection(client: any, ...args: any[]) {
		console.log("Connection socket:", client.id);
		
		// Get the user information from db and pass it to the user
		let userInfo = this.getUserInfo(client);
		const user_db = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user").
		where("user.username = :username", {username: userInfo.username_42}).getOne();
		client.emit("GetConnectionInfo", {
			user: {		
				username: user_db.username,
				displayname: user_db.display_name,
				img_url: user_db.img_url,
				campus_name: user_db.campus_name,
				campus_country: user_db.campus_country
			}
		});

		// Check the user and if the user is already connected
		if (!this.clients.has(userInfo.username_42)) {	
			this.clients.set(userInfo.username_42, new Client(userInfo.username_42, client));
		} else {
			let target = this.clients.get(userInfo.username_42);
			target.sockets.set(client.id, client);
			// Send user the room id if the user is in an on-going game
		}
	}

	public handleDisconnect(client: any): void {
		// Get rid of socket from the client instance
		let target = this.getClient(client);
		target.sockets.delete(client.id);
    }

	@SubscribeMessage("CheckOnGoing")
	checkOnGoing(@ConnectedSocket() client: Socket, @Request() req) {
		let target = this.getClient(req);
		if (target.state == UserState.Playing)
				client.emit("OnGoingRes", target.room);
	}

	@SubscribeMessage("JoinQueue")
	async joinQueue(@ConnectedSocket() client: Socket, @Request() req) {
		// Check if client is available
		let target = this.getClient(req);
		if (target.state != UserState.Available) {
			client.emit("JoinQueueError", (target.state == UserState.Waiting) ? ErrorMessage.AlreadyJoined : ErrorMessage.UserNotAvailble);
			return ;
		}

		// Join Queue
		this.queue.push([target.username, target]);
		target.state = UserState.Waiting

		// Game distribution
		if (this.queue.length > 1) {
			// create a random room for two players
			console.log(this.queue);
			let [target1, target2] = [this.clients.get(this.queue[0][0]), this.clients.get(this.queue[1][0])];
			let [player1, player2] = [this.getPlayerInfo(target1.username), this.getPlayerInfo(target2.username)];
			let gameInfo = { title: "", mapSize: getRandomInt(3), maxPoint: 10, puckSpeed: getRandomInt(3), paddleSize: getRandomInt(3), isPrivate: true }
			let room = new Room([player1, player2], [target1, target2], gameInfo, undefined, this.gameRep, this.mainServerService, this.dataSource, this.userService);
			this.rooms.set(room.id, room);
		
			// Switch their state into playing then get rid of them from the queue
			target1.isPlaying(room.id);
			target2.isPlaying(room.id);
			this.queue.splice(0, 2);

			// Broadcast to let them join the game
			room.broadcast("MatchFound", room.id);
		}
	}

	@SubscribeMessage("LeaveQueue")
	leaveQueue(@Request() req) {
		// Check if the target is effectively waiting for the game
		let target = this.getClient(req);
		if (target.state != UserState.Waiting)
			return ;

		// Get rid of the client from the queue and turn them back available
		let index = this.queue.findIndex(x => x[0] == target.username);
		this.queue.splice(index, 1);
		target.isAvailable();
	}

	@SubscribeMessage("RoomCheck")
	roomCheck(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check if the room exists and if room contains the user as client
		let target = this.getClient(req);
		let room = this.getRoom(data.room);
		if (!room) {
			client.emit("RoomCheckError", ErrorMessage.RoomNotFound);
			return ;
		} else if (!room.clients.has(target.username)) {
			client.emit("RoomCheckError", ErrorMessage.AccessNotPermitted);
			return ;
		}

		// Give the user the room information
		let players = Array.from(room.players.values());
		target.broadcast("RoomFound", {
			player1: {
				info: players[0].info,
				score: players[0].score,
				pos: room.pong.paddles[players[0].index].pos
			},
			player2: (players.length > 1) ? {
				info: players[1].info,
				score: players[1].score,
				pos: room.pong.paddles[players[1].index].pos
			} : undefined,
			hostname: room.hostname,
			gameInfo: room.gameInfo,
			puck: (room.pong.puck) ? {
				pos: room.pong.puck?.pos,
				vec: room.pong.puck?.vec
			} : undefined
		});
	}

	@SubscribeMessage("PaddleMoveKey")
	paddleMoveKey(@MessageBody() data: any, @Request() req) {
		// Check if the request came from a proper player
		let target = this.getClient(req);
		let room = this.getRoom(data.room);
		if (!room || !room.players.has(target.username))
			return ;

		// Get the player
		let player = room.players.get(target.username);

		// TODO protection switching between keyboard and mouse
		// Paddle starts to move, Websocket Messages set with interval
		let intervalID = setInterval(() => {
			room.pong.movePaddle(player.index, data.left);
			room.broadcast("PaddleUpdate", {
				player: player.username,
				pos: room.pong.paddles[player.index].pos
			});
		}, 20);
		player.control[0] = intervalID;
	}

	@SubscribeMessage("PaddleStopKey")
	paddleStopKey(@MessageBody() data: any, @Request() req) {
		// TODO is there any more efficient way to handle this?
		// Check if the request came from a proper player
		let target = this.getClient(req);
		let room = this.getRoom(data);
		if (!room || !room.players.has(target.username))
			return ;

		// Get the player
		let player = room.players.get(target.username);

		// clear the interval and delete it
		clearInterval(player.control[0].get(data));
		player.control[0] = undefined
	}

	@SubscribeMessage("RoomListReq")
	roomList(@ConnectedSocket() client: Socket) {
		// Get rooms which are not private
		let allRooms = [];
		for (let room of this.rooms.values()) {
			if (room.isPrivate)
				continue ;
			allRooms.push({
				id: room.id,
				players: Array.from(room.players.values(), x => x.info),
				gameInfo: room.gameInfo
			});
		}
		client.emit("RoomListRes", allRooms);
	}

	@SubscribeMessage("CreateRoom")
	async createRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {		
		// console.log("CreateRoom", data);
		// Check if the client is already playing or watching a game
		let target = this.getClient(req);
		console.log("Why didn't it work?", target.state, target.room);
		if (target.state != UserState.Available) {
			client.emit("CreateRoomError", ErrorMessage.UserNotAvailble);
			return ;
		}

		// Get the player's info and create the room with the data
		let player = await this.getPlayerInfo(target.username);
		let room = new Room([player], [target], data, target.username,
			this.gameRep, this.mainServerService, this.dataSource, this.userService);
		this.rooms.set(room.id, room);
		target.isPlaying(room.id);
		console.log("created", target);

		// Invite the user to the room
		target.broadcast("CreateRoomRes", room.id);
	}

	@SubscribeMessage("JoinRoom")
	async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check whether the room exists and whether the room is available if the user wants to play
		let target = this.getClient(req);
		let room = this.getRoom(data.roomID);
		if (!room) {
			client.emit("JoinRoomError", ErrorMessage.RoomNotFound);
			return ;
		} else if (room.players.size > 1 && data.play) {
			client.emit("JoinRoomError", ErrorMessage.RoomNotAvailble);
			return ;
		}

		// If the user wants to play
		if (data.play) {
			// broadcast to the users in the room that there is a new player then add player in the room
			const newPlayer = await this.getPlayerInfo(target.username);
			room.broadcast("PlayerUpdate", {
				info: newPlayer,
				score: 0,
				pos: (MapSize[room.gameInfo.mapSize][0] - PaddleSize[room.gameInfo.paddleSize]) / 2
			});
			target.isPlaying(room.id);
			room.playerJoin(newPlayer, target);
		} else {
			// If the user only wants to watch, add the user in the client list
			target.isWatching(room.id);
			room.addClient(target);
		}

		// tell either the player or the watcher that they can join the room
		target.broadcast("JoinRoomRes", data.roomID);
	}

	@SubscribeMessage("ExitRoom")
	exitRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check if the user is in the room
		let target = this.getClient(req);
		let room = this.getRoom(data.roomID);
		if (!room || !room.clients.has(target.username))
			return ;
	
		// Check if the user is one of the players
		if (room.players.has(target.username)) {
			let res = room.playerExit(target);
			// Destroy the room if the game is finished or there is no more player left.
			if (!res)
				this.rooms.delete(room.id);
		} else {
			// if the user is a watcher, remove the user from clients of the room
			room.clients.delete(target.username);
		}
	}

	@SubscribeMessage("isReady")
	setReady(@MessageBody() data: any, @Request() req) {
		// Check if the client is a guest player in the room
		let target = this.getClient(req);
		let room = this.getRoom(data.roomID);
		if (!room || !room.players.has(target.username) || room.hostname == target.username)
			return ;

		// Set room state and broadcast
		room.isReady = data.isReady;
		room.broadcast("ReadyUpdate", room.isReady);
	}

	@SubscribeMessage("StartGame")
	startGame(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check if the client is a host player in the room and room is full
		let target = this.getClient(req);
		let room = this.getRoom(data);
		if (!room || !room.players.has(target.username) || room.hostname != target.username || room.players.size != 2)
			return ;

		// Check if the guest player is ready
		if (!room.isReady) {
			client.emit("StartGameError", ErrorMessage.RoomNotReady);
			return ;
		}

		// Start game and broadcast
		room.startPong();
		room.broadcast("GameStart", undefined);
	}

	broadcast(clients: any, event: string, data: any) {
		for (let client of clients)
			client.emit(event, data);
	}

	static broadcast(clients: any, event: string, data: any) {
		for (let client of clients)
			client.emit(event, data);
	}

	@SubscribeMessage("getHistory")
	async getHistGame(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req) {
		let id_user = await this.mainServerService.getIdUser(req);
		const res = await this.dataSource.getRepository(GameEntity).createQueryBuilder("game")
		.innerJoin("game.player1", "user1")
		.innerJoin("game.player2", "user2")
		.where("game.player1.id_g = :u or game.player2.id_g = :u", {u: id_user})
		.select(["game.player1_score", "game.player2_score", "user1.username", "user2.username", "user1.img_url", "user1.img", "user2.img_url", "user2.img", "game.date_game"]).getMany();
		client.emit("resHistory", res);
	}

	@SubscribeMessage("RankingReq")
	async getRankedUsers(@ConnectedSocket() client: Socket) {
		const res = await this.dataSource.createQueryRunner()
		.query("SELECT sum(games.is_winner) as nb_victory, count(games.is_winner) as nb_game, \
				((cast(sum(games.is_winner) as float) / count(games.is_winner)) * 100) as win_rate, \
				min(user_entity.username) as username, min(user_entity.campus_name) as campus_name, \
				min(user_entity.campus_country) as campus_country, min(user_entity.img_url) as img_url, \
				min(user_entity.display_name) as displayname \
				FROM ( \
					SELECT \"player1IdG\" as id_player, (CASE WHEN player1_score > player2_score THEN 1 ELSE 0 END) as is_winner FROM game_entity as game1 \
						UNION \
					SELECT \"player2IdG\" as id_player, (CASE WHEN player2_score > player2_score THEN 1 ELSE 0 END) as is_winner FROM game_entity as game2) \
					as games inner join user_entity on games.id_player = user_entity.id_g \
				GROUP BY id_player \
				ORDER BY nb_victory DESC, win_rate DESC; ", []);
		client.emit("RankingRes", res);
	}

	getRoom(id: string) { return (this.rooms.get(id)); }

	getClient(request: any) {
		const user: any = (this.jwtService.decode(request.handshake.headers.authorization.split(' ')[1]));
		return this.clients.get(user.username_42);
	}

	getUserInfo(request: any) {
		const user: any = (this.jwtService.decode(request.handshake.headers.authorization.split(' ')[1]));	
		return user;
	}

	async getPlayerInfo(player: any) {
		const userdata = await this.userService.findOne(player)
		return ({
			username: userdata.username,
			username_42: userdata.username_42,
			displayname: userdata.display_name,
			img_url: userdata.img_url,
			campus_name: userdata.campus_name,
			campus_country: userdata.campus_country,
		});
	}
}