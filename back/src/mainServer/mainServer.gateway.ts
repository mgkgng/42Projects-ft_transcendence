import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
  } from '@nestjs/websockets';
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Repository, DataSource} from 'typeorm';
import { UserEntity } from 'src/entity/User.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageChatRoomEntity } from 'src/entity/MessageChatRoom.entity';
import { Socket } from 'socket.io';
import { Interval } from '@nestjs/schedule';
import { GameEntity } from 'src/entity/Game.entity';
import { Client } from "src/Client";
import { Room } from 'src/Room';

// class game
// {
// 	id_game : number = 0;
// 	c1 : Client;
// 	c2 : Client;

// 	score_p1 : number = 0;
// 	score_p2 : number = 0;
// 	is_playing = false;

// 	balle_x : number = 0;
// 	balle_y : number = 0;
// 	v_x : number = 10;
// 	v_y : number = 5;

// 	constructor(client_one : Client, client_two : Client, id_game: number)
// 	{
// 		this.c1 = client_one;
// 		this.c2 = client_two;
// 		this.id_game = id_game;
// 	}
// 	check_ball()
// 	{
// 		this.balle_x += this.v_x;
// 		this.balle_y += this.v_y;
// 		if (this.balle_x >= 889 || this.balle_x <= 0)
// 		{
// 			this.v_x *= -1;
// 			return (true);
// 		}
// 		if (this.balle_y >= 500 || this.balle_y <= 0)
// 		{
// 			this.v_y *= -1;
// 			return (true);
// 		}
// 		return (false);
// 	}
// }

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class MainServerService {
	constructor(
		private dataSource : DataSource,
		private jwtServer: JwtService, 
	){
	}
	@WebSocketServer() server;
	wait_list: Client[] = []; //WAIT LIST FOR MATCHMAKING
	rooms : Map<string, Room>;	  //LIST OF GAMES WHICH IS RUNNING

	after_init()
	{
	}

	handleDisconnect()
	{
		console.log('Disconnect');
	}
	async getIdUser(@Request() req) //GET THE UNIQ ID OF A USER
	{
		const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		const client_username = user.username;
		const id_user : any = await this.dataSource.getRepository(UserEntity)
		.createQueryBuilder().where("UserEntity.username = :u", { u: client_username }).getOneOrFail();
		return (id_user.id_g);
	}
	async getIdUserByUsername(username : string) //GET THE UNIQ ID OF A USER FIND WITH USER'S USERNAME
	{
		const client_username : any = username;
		const id_user = await this.dataSource.getRepository(UserEntity)
		.createQueryBuilder().where("UserEntity.username = :u", { u: client_username }).getOneOrFail();
		return (id_user.id_g);
	}
	async getIdRoom (@MessageBody() name) //GET THE UNIQ ID OF A ROOM FIND WITH THE ROOM'S NAME 
	{
		const id_user : any = await this.dataSource.getRepository(ChatRoomEntity)
		.createQueryBuilder().where("ChatRoomEntity.name = :u", { u: name.room_name}).getOneOrFail();
		return (id_user.id_g);
	}

	async getNamesRoomsForUser(@Request() req) //GET ALL NAMES OF ROOM IN WITH THE CURRENT USER IS IN 
	{
		const id_user = await this.getIdUser(req);	
		const names_rooms : any = await this.dataSource.getRepository(UserChatRoomEntity)
		.createQueryBuilder("userRooms").innerJoinAndSelect("userRooms.room", "chatRoom")
		.where("userRooms.id_user = :u", { u: id_user })
		.andWhere("(userRooms.ban_end < :d OR userRooms.ban_end is null)", { d: new Date() })
		.select(["userRooms.id", "chatRoom.name"]).getMany();
		return (names_rooms);
	}
	//TRY MAKE A LITTLE MATCH MAKING
	async create_games() // MAKE GAMES (MATCH MACKING)
	{
		// There could be more precise condition to make matchmaking.
		// ex) clients could search for certain 'type' of games
		console.log("create_game");
		while (this.wait_list.length > 1)
		{
			console.log("create_game_while");
			const id_one : any = await this.getIdUserByUsername(this.wait_list[0].username);
			const id_two : any = await this.getIdUserByUsername(this.wait_list[1].username);

			const querry = this.dataSource.createQueryRunner(); 
			await querry.connect();
			await querry.startTransaction();
			// const res_game_entity : any = await querry.manager.insert(GameEntity,
			// 	{player1: id_one, player2: id_two, date_game: new Date(), is_finished: false, is_cancelled: false, is_abandoned: false, is_disconnected: false}
			// );
			await querry.commitTransaction();

			let room = new Room([id_one, id_two]);
			this.rooms[room.id] = room;

			room.broadcast();

			this.wait_list = this.wait_list.slice(1);
		}
	}
	@SubscribeMessage('add_in_wait_list') //WHEN SOMEONE WANT TO PLAY
	async enter_in_game(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		const jwt : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		for (let c of this.wait_list)
		{
			if (c.username == jwt.username)
				throw new WsException("Already in queu");
		}
		console.log("add client");
		this.wait_list.push(new Client(client, jwt.username));
		this.create_games();
		client.emit("add_in_wait_list");
	}
	// @Interval(1000 / 30) //WHILE(1) 30 TIME / S
	// init_game()
	// {
	// 	if (this.rooms.size)
	// 	{
	// 		for (let room of this.rooms)
	// 		{
	// 			room.check_ball();
	// 			room.c1.sock.emit("set_data", {x: room.balle_x, y: room.balle_y});
	// 			room.c2.sock.emit("set_data", {x: room.balle_x, y: room.balle_y});
	// 		}
	// 	}
	// }
	@SubscribeMessage('test') // TEST
	handleEvent(@MessageBody('data') data: string, @ConnectedSocket() client: Socket): string {
		return (data);
	}


	static broadcast(clients: Array<Client>, msg: any) {
		for (let client of clients)
			client.sock.send(msg);
	}
	
}