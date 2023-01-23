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
import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { UserService } from "src/user/user.service";
import { ErrorMessage, getRandomInt, MapSize, PaddleSize, RoomUpdate, UserState } from "./game.utils";
import { UserEntity } from "src/entity/User.entity";
import { friendSystemService } from "src/friendSystem/friendSystem.service";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { ChatDirectMessageService } from "src/chatDirectMessage/chatDirectMessage.service";
import { Player } from "./game.Player";

//TODO Too many connections for a client
//TODO if the client websocket contains request, handshake..
//TODO put username_42 inside of client and replace everything with it

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	clients: Map<string, Client>;
	rooms: Map<string, Room>;
	queue: Array<any>;

	constructor(private mainServerService : MainServerService, private jwtService: JwtService, 
				@InjectRepository(GameEntity) private gameRep: Repository<GameEntity>,
				@InjectRepository(UserEntity) private userRep : Repository<UserEntity>,
				@InjectRepository(UserFriendEntity) private userFriendRepository : Repository<UserFriendEntity>,
				@InjectRepository(UserBlockEntity) private userBlockRepository : Repository<UserBlockEntity>,
				@InjectRepository(UserEntity) private userRepository : Repository<UserEntity>,
				@Inject(friendSystemService) private friendSystemService : friendSystemService,		
				@Inject(ChatDirectMessageService) private chatDirectMessageService : ChatDirectMessageService,
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
		// console.log("Connection socket:", client.id);
		
		// Get the user information from db and pass it to the user
		let userInfo = this.getUserInfo(client);

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
		if (!target)
			return ;
		target.sockets.delete(client.id);
    }

	@SubscribeMessage("CheckOnGoing")
	checkOnGoing(@ConnectedSocket() client: Socket, @Request() req) {
		let target = this.getClient(req);
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
			let [target1, target2] = [this.clients.get(this.queue[0][0]), this.clients.get(this.queue[1][0])];
			let [player1, player2] = [await this.getPlayerInfo(target1.username), await this.getPlayerInfo(target2.username)];
			let gameInfo = { title: "", mapSize: getRandomInt(3), maxPoint: 10, puckSpeed: getRandomInt(3), paddleSize: getRandomInt(3), isPrivate: true }
			let room = new Room([player1, player2], [target1, target2], gameInfo, "", undefined, 
				this,
				this.gameRep, this.mainServerService, this.dataSource, this.userService);
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
		let room = this.getRoom(data);
		if (!room) {
			client.emit("RoomCheckError", ErrorMessage.RoomNotFound);
			return ;
		} else if (!room.clients.has(target.username)) {
			client.emit("RoomCheckError", ErrorMessage.AccessNotPermitted);
			return ;
		}

		if (room.invited && target.username !== room.invited && target.username !== room.hostname) {
			client.emit("RoomCheckError", ErrorMessage.NotInvited);
			return ;
		}

		// Give the user the room information
		let players = Array.from(room.players.values());
		target.broadcast("RoomFound", {
			player1: {
				info: players[0].info,
				score: players[0].score,
				pos: players[0].paddle.pos
			},
			player2: (players.length > 1) ? {
				info: players[1].info,
				score: players[1].score,
				pos: players[1].paddle.pos
			} : undefined,
			hostname: room.hostname,
			invited: room.invited,
			gameInfo: room.gameInfo,
			puck: (room.puck) ? {
				pos: room.puck.pos,
				vec: room.puck.vec
			} : undefined
		});
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
		if (target.state != UserState.Available) {
			client.emit("CreateRoomError", ErrorMessage.UserNotAvailble);
			return ;
		}

		// Get the player's info and create the room with the data
		let player = await this.getPlayerInfo(target.username);
		let room = new Room([player], [target], data, target.username, undefined,
			this,
			this.gameRep, this.mainServerService, this.dataSource, this.userService);
		this.rooms.set(room.id, room);
		target.isPlaying(room.id);

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
		} else if ([...room.players.keys()].includes(target.username)) {
			client.emit("JoinRoomRes", {
				allowed: true,
				roomID: room.id
			});
			return ;
		} else if (room.players.size > 1 && data.play) {
			client.emit("JoinRoomError", ErrorMessage.RoomNotAvailble);
			return ;
		}

		if (room.invited && !(target.username == room.invited.username || target.username == room.hostname)) {
			client.emit("RoomCheckError", ErrorMessage.NotInvited);
			return ;
		}

		// If the user wants to play
		if (data.play === true) {
			// broadcast to the users in the room that there is a new player then add player in the room
			const newPlayer = await this.getPlayerInfo(target.username);
			room.broadcast("PlayerUpdate", {
				join: true,
				player: {
					info: newPlayer,
					score: 0,
					pos: (MapSize[room.gameInfo.mapSize][0] - PaddleSize[room.gameInfo.paddleSize]) / 2
				}
			});
			target.isPlaying(room.id);
			room.playerJoin(newPlayer, target);
		} else {
			// If the user only wants to watch, add the user in the client list
			target.isWatching(room.id);
			room.addClient(target);
			target.broadcast("JoinRoomRes", {
				allowed: true,
				roomID: room.id
			});
		}
	}

	@SubscribeMessage("ExitRoom")
	exitRoom(@ConnectedSocket() client: Socket, @MessageBody() data: any, @Request() req) {
		// Check if the user is in the room
		let target = this.getClient(req);
		let room = this.getRoom(data.roomID);
		if (!room || !room.clients.has(target.username))
			return ;
	
		// Check if the user is one of the players
		if (room.players.has(target.username)) 
			room.playerExit(target);
		else // if the user is a watcher, remove the user from clients of the room
		{
			room.clients.delete(target.username);
			target.room = "";
		}
	}


	@SubscribeMessage("isReady")
	setReady(@MessageBody() data: any, @Request() req) {

		// console.log(data);
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
		room.isStarted = true;
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
		try{
			let id_user = await this.mainServerService.getIdUserByUsername(data.username);
			console.log(id_user);
			//let id_user = await this.mainServerService.getIdUser(req);
			const res = await this.dataSource.getRepository(GameEntity).createQueryBuilder("game")
			.innerJoin("game.player1", "user1")
			.innerJoin("game.player2", "user2")
			.where("game.player1.id_g = :u or game.player2.id_g = :u", {u: id_user})
			.select(["game.player1_score", "game.player2_score", "user1.username", "user2.username", "game.date_game"]).getMany();
			client.emit("resHistory", res);
		}catch (e){
			console.log("error get_history", e);
			client.emit("error_resHistory", {error : "Bad data"});
		}
	}

	@SubscribeMessage("RankingReq")
	async getRankedUsers(@ConnectedSocket() client: Socket) {
		const res = await this.dataSource.createQueryRunner()
		.query("SELECT sum(games.is_winner) as nb_victory, count(games.is_winner) as nb_game, \
				((cast(sum(games.is_winner) as float) / count(games.is_winner)) * 100) as win_rate, \
				min(user_entity.username) as username, min(user_entity.campus_name) as campus_name, \
				min(user_entity.campus_country) as campus_country, min(user_entity.img_url) as img_url, \
				min(user_entity.img) as img, min(user_entity.displayname) as displayname, \
				min(user_entity.created_at) as created_at, min(user_entity.last_connection) as last_connection \
				FROM ( \
					SELECT \"player1IdG\" as id_player, (CASE WHEN player1_score > player2_score THEN 1 ELSE 0 END) as is_winner FROM game_entity as game1 \
						UNION ALL\
					SELECT \"player2IdG\" as id_player, (CASE WHEN player2_score > player1_score THEN 1 ELSE 0 END) as is_winner FROM game_entity as game2) \
					as games inner join user_entity on games.id_player = user_entity.id_g \
				GROUP BY id_player \
				ORDER BY nb_victory DESC, win_rate DESC; ", []);
		client.emit("RankingRes", res);

	}

	@SubscribeMessage('CheckNewUsername')
	async checkNewUsername(@ConnectedSocket() client: Socket, @MessageBody() data)
	{
		try {
			const res = await this.dataSource.getRepository(UserEntity)
			.createQueryBuilder("user")
			.select(["user.username"])
			.where("user.username = :u", { u: data }).getOneOrFail();
			client.emit("CheckNewUsernameRes", {
				err: true,
				msg: ErrorMessage.TakenUsername
			});
		} catch(e){
			client.emit("CheckNewUsernameRes", {
				err: false
			})
		}
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

	async getUsername42ByUsername(username: string): Promise<string>  {
		const user = await this.userRep.findOne({ where: { username } });
		return user?.username_42;
		
	}

	async getPlayerInfo(player: any) {
		const userdata = await this.userService.findOne(player)
		return ({
			username: userdata.username,
			username_42: userdata.username_42,
			displayname: userdata.displayname,
			img_url: userdata.img_url,
			campus_name: userdata.campus_name,
			campus_country: userdata.campus_country,
		});
	}

	// @SubscribeMessage('CheckNewUsername')
	// async checkNewUsername(@ConnectedSocket() client: Socket, @MessageBody() data, @Request() req)
	// {
	// 	try {
	// 		const id_user = await this.mainServerService.getIdUser(req);
	// 		try{
	// 			const res = await this.dataSource.getRepository(UserEntity)
	// 			.createQueryBuilder("user")
	// 			.select(["user.username"])
	// 			.where("user.username = :u", {u: data.new_username}).getOneOrFail();
	// 			await client.emit("error_change_username", "Username already taken");
	// 			console.log("Username already taken ", client.id);
	// 			return;
	// 		} catch(e){
	// 			if (data.new_username.length == 0 || data.new_username.length > 20)
	// 			{
	// 				await client.emit("error_change_username", "Username not in good fromat");
	// 				return;
	// 			}
	// 			const res = await this.dataSource.createQueryBuilder().update(UserEntity)
	// 			.where("id_g = :u", {u: id_user})
	// 			.set({username: data.new_username}).execute();
	// 			await client.emit("change_username", {new_username: data.new_username});
	// 			console.log("Username changed ", client.id);
	// 			return;
	// 		}
	// 	} catch(e){
	// 		await client.emit("error_change_username", "Data error");
	// 		console.log("Data error ", client.id);
	// 	}
	// }

	/** From here, it is about friend system, direct messages and the notification */
	/* I need to do this here in order to finish the project as soon as possible */

	@SubscribeMessage('reqFriendAndMessage')
	async sendFriendAndMessage(@ConnectedSocket() client: Socket, @Request() req) {
		let target = this.getClient(req);
		client.emit("updateFriendAndMessage", {
			messages: Array.from(target.newMessages.keys()),
			requests: Array.from(target.newRequests.keys())
		})
	}

	@SubscribeMessage('requestsChecked')
	requestChecked(@Request() req) {
		let target = this.getClient(req);
		target.newRequests.clear();
	}

	@SubscribeMessage('messagesChekced')
	messagesChecked(@Request() req) {
		let target = this.getClient(req);
		target.newMessages.clear();
	}

	@SubscribeMessage("PaddleMoveMouse")
	paddleMoveMouse(@MessageBody() data: any, @Request() req) {
		// Check if the request came from a proper player

		let target = this.getClient(req);
		let room = this.getRoom(data.roomID);
		if (!room || !room.players.has(target.username))
			return ;

		// Get the player
		let player = room.players.get(target.username);
		player.paddle.pos = data.pos;
		room.broadcast("PaddleUpdate", {
			type: player.index,
			pos: data.pos
		});
	}


	@SubscribeMessage('askFriendG')
	async askFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRep.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
		const friend = await this.userRep.findOne({where: {username_42: data.username_42}});

		if (!user || !friend) {
			this.server.to(client.id).emit('error_askFriendG', {error: "User not found"});
			return;
		}

		const userAskList = await this.friendSystemService.getAskList(user.username);
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		if (userAskList.find((user) => user.username == friend.username) || userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_askFriendG', {error: "User already asked as friend"});
			return;
		}
		else
		{
			const userFriend = await this.friendSystemService.askFriend(user.username, friend.username);
			let target = this.clients.get(friend.username_42);
			target.updateRequest(user.username_42, true);

			this.server.to(client.id).emit('success_askFriendG', {friend: friend.username});
			return;
		}
	}

	@SubscribeMessage('unAskFriendG')
	async unAskFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRep.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
		const friend = await this.userRep.findOne({where: {username_42: data.username_42}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_unAskFriendG', {error: "User not found"});
			return;
		}
		const userAskerList = await this.friendSystemService.getAskListWhereUserIsAsker(user.username);
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		if (userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_unAskFriendG', {error: "User already friend"});
			return;
		}
		else if (!userAskerList || !userAskerList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_unAskFriendG', {error: "User not asked as friend or refused"});
			return;
		}
		else
		{
			await this.friendSystemService.unAskFriend(user.username, friend.username);
			let target = this.clients.get(friend.username_42);
			target.updateRequest(user.username_42, false);

			this.server.to(client.id).emit('success_unAskFriendG', {friend: friend.username});
			return ;
		}
	}

	@SubscribeMessage('sendDirectMessageG')
	async sendMessage(@MessageBody() data: any, @ConnectedSocket() client: any, @Request() req) {
		let gameInvitation = data.message.startsWith("/gameInvitation/");
		let messageToSave = data.message;
		if (gameInvitation) {
			let target = this.getClient(req);
			if (target.state !== UserState.Available) {
				client.emit("gameInvitationRes", {
					success: false,
					msg: "You are currently not able to create a new game."
				})
				return ;
			}
			let player = await this.getPlayerInfo(target.username);
			let invited = await this.getPlayerInfo(data.username);
			let args = messageToSave.split("/");
			console.log(args);
			//TODO parsing + error
			let gameInfo = {
				title: "", 
				mapSize: parseInt(args[2]), 
				maxPoint: parseInt(args[5]), 
				puckSpeed: parseInt(args[3]),
				paddleSize: parseInt(args[4]),
				isPrivate: true
			};
			
			//TODO get username by username42 (for the invited)
			let room = new Room([player], [target], gameInfo, target.username, invited, this, this.gameRep, this.mainServerService, this.dataSource, this.userService)
			this.rooms.set(room.id, room);
			target.isPlaying(room.id);

			client.emit("gameInvitationRes", {
				success: true,
				msg: "The game has been created. Do you want to join the room?",
				roomID: room.id
			});
			messageToSave = `/gameInvitation/${room.id}/${args[6]}`;
		}

		const user = await this.userRepository.findOne({
			where: {username_42: data.username_42}
		});
		const userSender = await this.userRepository.findOne({
			where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}
		});
		if (!user || !userSender)
		{
			this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'User not found'});
			return;
		}
		if (await this.friendSystemService.isUserBlocked(userSender.username, user.username))
		{
			this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'User blocked'});
			return;
		}
		if (await this.friendSystemService.isUserBlocked(user.username, userSender.username))
		{
			this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'You\'ve been blocked by this user'});
			return;
		}
		const userConnected = this.mainServerService.getUserConnectedByUsername42(data.username_42);
		if (userConnected && !(await this.friendSystemService.isUserBlocked(user.username, userSender.username))) {
			let target = this.clients.get(user.username_42);
			target.newMessageReceived(userSender.username);
		}
		let ret = await this.chatDirectMessageService.handleSendDirectMessage(this.mainServerService.getUserConnectedBySocketId(client.id).username_42, user.username_42, messageToSave);
		if (ret)
			this.server.to(client.id).emit('success_sendDirectMessageG', {message: messageToSave});
		else
			this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'An error occured'});
		if (!(await this.friendSystemService.isUserBlocked(user.username, userSender.username)))
		{
			// For whatever reason if i use success_getDirectMessage it doesnt work, apparently is a bug about namespaces
			this.server.to(client.id).emit('getDirectMessage', { id: ret.id_g, sender: ret.message_sender.username_42, recipient: ret.message_recipient.username_42, message: ret.string, date: ret.date});
			if (userConnected)
			{
				let emitList = this.mainServerService.getUserConnectedListBySocketId(this.mainServerService.getUserConnectedByUsername42(data.username_42).id);
				emitList.forEach(element => {
					this.server.to(element.id).emit('getDirectMessage', { id: ret.id_g, sender: ret.message_sender.username_42, recipient: ret.message_recipient.username_42, message: ret.string, date: ret.date});
				});
			}
		}
	}
}