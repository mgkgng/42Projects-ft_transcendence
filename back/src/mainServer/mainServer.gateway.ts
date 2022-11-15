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
import { Like } from 'typeorm';

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
		@InjectRepository(UserEntity)
		private userRepository : Repository<UserEntity>,
	){
	}
	@WebSocketServer() server;
	userConnectedList = []; // userConnectedList[] = {username : "username", socket : socket, status : "online" | "in game" | "offline"}

	// Function that will return the userConnectList entry by socketId if found
	getUserConnectedBySocketId(socketId : string) : any {
		for (let i = 0; i < this.userConnectedList.length; i++) {
			if (this.userConnectedList[i].socket.id == socketId)
				return this.userConnectedList[i];
		}
		return null;
	}

	// Function that will return the userConnectList entry by username if found
	getUserConnectedByUsername(username : string) : any {
		for (let i = 0; i < this.userConnectedList.length; i++) {
			if (this.userConnectedList[i].username == username)
				return this.userConnectedList[i];
		}
		return null;
	}
	

	//@UseGuards(AuthGuard("jwt"))
	handleConnection(@Request() req)
	{
		console.log("Connect to main");
		const user : any = (this.jwtServer.decode(req.handshake?.headers?.authorization.split(' ')[1]));
		const client_username : string = user?.username_42;
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
		 const client_username = user.username_42;
		 const id_user : any = await this.dataSource.getRepository(UserEntity)
		 .createQueryBuilder().where("UserEntity.username_42 = :u", { u: client_username }).getOneOrFail();
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
		.andWhere("userRooms.is_visible = TRUE")
		.andWhere("(userRooms.ban_end < :d OR userRooms.ban_end is null)", { d: new Date() })
		.select(["userRooms.id", "chatRoom.name", "userRooms.is_admin", "userRooms.is_owner", "chatRoom.is_password_protected", "chatRoom.is_private"]).getMany();
		return (names_rooms);
	}

	@SubscribeMessage('getUserinDB')
	async getUserinDB(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		if (data.username.length < 1)
			return;
		const users = await this.userRepository.find({where: {username: Like(data.username + "%")}, take: 8});
		if (!users || users.length < 1)
		{
			console.log("ERROR GET USER IN DB");
			this.server.to(client.id).emit('error_getUserinDB', {error: "No user found"});
			return;
		}
		else
		{
			const parsedList = users.map((user) => {
				return {username: user.username, img_url: user.img_url, status: this.getUserStatus(user.username)}});
			const index = parsedList.indexOf(this.getUserConnectedBySocketId(client.id).username);
			if (index > -1) {
				parsedList.splice(index, 1);
			}
			this.server.to(client.id).emit('success_getUserinDB', {users: parsedList});
			return;
		}
	}
	
}