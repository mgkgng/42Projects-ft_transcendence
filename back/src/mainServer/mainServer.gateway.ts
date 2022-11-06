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


@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
//@WebSocketGateway(3001)
export class MainServerService {
	constructor(
		private dataSource : DataSource,
		private jwtServer: JwtService, 
	){
	}
	@WebSocketServer() server;
	userConnectedList = []; // userConnectedList[] = {username : "username", socket : socket, status : "online" | "in game" | "offline"}

	//@UseGuards(AuthGuard("jwt"))
	handleConnection(@Request() req)
	{
		console.log("Connect to main");
		const user : any = (this.jwtServer.decode(req.handshake?.headers?.authorization.split(' ')[1]));
		const client_username : string = user?.username;
		let userConnected = {username: client_username, socket: req, status: "online"};
		this.userConnectedList.push(userConnected);
		//console.log(this.userConnectedList);
	}

	handleDisconnect(@Request() req)
	{
		for (let i = 0; i < this.userConnectedList.length; i++)
		{
			if (this.userConnectedList[i].socket === req)
			{
				// console.log(`User ${this.userConnectedList[i].username} deleted`);
				this.userConnectedList.splice(i, 1);
			}
		}
	}

	after_init()
	{
	}

	// Return the status of a user (online | in game) otherwise return offline
	// the user must exist to use this function
	getUserStatus(username : string) : string
	{
		for (let i = 0; i < this.userConnectedList.length; i++)
		{
			if (this.userConnectedList[i].username === username)
				return this.userConnectedList[i].status;
			else
				return "offline";
		}
		return "offline";
	}

	async getIdUser(@Request() req) //GET THE UNIQ ID OF A USER
	{
		 const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		 const client_username = user.username;
		 console.log(client_username);
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
		console.log(name);
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
		.andWhere("userRooms.is_visible = TRUE")
		.andWhere("(userRooms.ban_end < :d OR userRooms.ban_end is null)", { d: new Date() })
		.select(["userRooms.id", "chatRoom.name"]).getMany();
		return (names_rooms);
	}
	//OK
	//{}
	//get email, username, img of current socket user
	@SubscribeMessage('get_user_info')
	async get_user_infos(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const id_user = await this.getIdUser(req);
			const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
						.where("id_g = :id", {id : id_user})
						.select(["user.email", "user.username", "user.img_url", "user.display_name", "user.campus_name", "user.campus_country"]).getOne();
			return (res);
		}catch(e)
		{
			throw new WsException("User not found");
		}
	}
	//OK
	//{username_search : string}
	@SubscribeMessage('get_other_user_info')
	async get_other_user_infos(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const id_user = await this.getIdUserByUsername(data.username_search);
			const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
						.where("id_g = :id", {id : id_user})
						.select(["user.email", "user.username", "user.img_url", "user.display_name", "user.campus_name", "user.campus_country"]).getOne();
			return (res);
		}catch(e)
		{
			client.emit("error_get_other_user_info", "User not found");
			throw new WsException("User not found");
		}
	}
	//{research: string}
	@SubscribeMessage('get_all_username_begin_by')
	async getAllRoomsBeginBy(@MessageBody() data, @ConnectedSocket() client: Socket)
	{
		const res = await this.dataSource.getRepository(UserEntity)
		.createQueryBuilder("user")
		.select(["user.username"])
		.where("substr(user.username, 1, :l) = :s", {l: data.research.length, s: data.research}).getMany();
		console.log(res);
		client.emit("get_all_username_begin_by", res);
	}
}