import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/entity/User.entity';
import { Repository, DataSource} from 'typeorm';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';
import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { MessageBody } from '@nestjs/websockets';

global.userConnectedList = []; // userConnectedList[] = {username : "username", socket : socket, status : "online" | "in game" | "offline"}
global.notificationList = [] // notification[] = {username : "username", type : "notification", data: {data Object if theres is data}, id: "id of the notification"}

@Injectable()
export class MainServerService {
	constructor(
		private dataSource : DataSource,
		private jwtServer: JwtService,
		@InjectRepository(UserEntity)
		private userRepository : Repository<UserEntity>,
	){}

	
		// Function that will return the userConnectList entry by socketId if found
		getUserConnectedBySocketId(socketId : string) : any {
			for (let i = 0; i < global.userConnectedList.length; i++) {
				if (global.userConnectedList[i].socket.id == socketId)
					return global.userConnectedList[i];
			}
			return null;
		}

		// Take a string socketId as param and return the list of socket connected to this username linked
		// to the socketId
		getUserConnectedListBySocketId(socketId: string) : any {
			let list = [];
			let username = this.getUserConnectedBySocketId(socketId).username;
			for (let i = 0; i < global.userConnectedList.length; i++) {
				if (global.userConnectedList[i].username == username)
					list.push(global.userConnectedList[i].socket);
			}
			return list;
		}

		// Function that will return the userConnectList entry by username if found
		getUserConnectedByUsername(username : string) : any {
			for (let i = 0; i < global.userConnectedList.length; i++) {
				if (global.userConnectedList[i].username == username)
					return global.userConnectedList[i].socket;
			}
			return null;
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
		.createQueryBuilder().where("ChatRoomEntity.id_public_room = :u", { u: name.id_public_room }).getOneOrFail();
		return (id_user.id_g);
	}

	async getNamesRoomsForUser(@Request() req) //GET ALL NAMES OF ROOM IN WITH THE CURRENT USER IS IN 
	{
		const id_user = await this.getIdUser(req);	
		const names_rooms : any = await this.dataSource.getRepository(UserChatRoomEntity)
		.createQueryBuilder("userRooms").innerJoinAndSelect("userRooms.room", "chatRoom")
		.where("userRooms.id_user = :u", { u: id_user })
		.andWhere("userRooms.is_visible = :p", { p: true })
		.andWhere("(userRooms.ban_end < :d OR userRooms.ban_end is null)", { d: new Date() })
		.select(["userRooms.id", "chatRoom.id_public_room" , "chatRoom.name", "userRooms.is_admin", "userRooms.is_owner", "chatRoom.is_password_protected", "chatRoom.is_private"]).getMany();
		return (names_rooms);
	}

	// Return the status of a user (online | in game) otherwise return offline
	// the user must exist to use this function
	getUserStatus(username : string) : string
	{
		for (let i = 0; i < global.userConnectedList.length; i++)
		{
			if (global.userConnectedList[i].username === username)
				return global.userConnectedList[i].status;
			else
				return "offline";
		}
		return "offline";
	}

	// function that will add a notification
	async addNotification(username : string, type : string, data : any)
	{
		global.notificationList.push({username : username, type : type, data : data, id: global.notificationList.length});
	}

	// function that will delete a notification
	async deleteNotification(username : string, id: any)
	{
		for (let i = 0; i < global.notificationList.length; i++)
		{
			if (global.notificationList[i].username === username && global.notificationList.id === id)
			{
				global.notificationList.splice(i, 1);
				return;
			}
		}
	}

	// function that will return the notification list of a user
	async getNotificationListByUsernameAndDelete(username : string)
	{
		let list = [];
		for (let i = 0; i < global.notificationList.length; i++)
		{
			if (global.notificationList[i].username === username)
			{
				list.push(global.notificationList[i]);
				list.splice(i, 1);
			}
		}
		return list;
	}
}