import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { ChatRoomEntity } from "src/entity/ChatRoom.entity";
import { MessageChatRoomEntity } from "src/entity/MessageChatRoom.entity";
import { UserEntity } from "src/entity/User.entity";
import { UserChatRoomEntity } from "src/entity/UserChatRoom.entity";
import { DataSource } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.service";
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { AuthGuard } from "@nestjs/passport";
import { toDataURL } from "qrcode";
import { authenticator } from "otplib";
import { WsThrottlerGuard } from "src/auth/reate_limitter" 
import * as bcrypt from 'bcrypt';

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class ChatRoomService {
	constructor(
		private dataSource : DataSource,
		private jwtServer: JwtService, 
		private mainServer: MainServerService,
	){
	}
	@WebSocketServer() server;

	//@UseGuards(AuthGuard('jwt'))
	async handleConnection(@Request() req)
	{
		const client : Socket = req;
		try {
			const names = await this.mainServer.getNamesRoomsForUser(req);
			for (let n of names) //ADD USER TO HIS ROOMS
			{
				const name : string = n.room.id_public_room;
				//console.log("Join => ", n.room.id_public_room);
				await client.join(n.room.id_public_room);
			}
		} catch (e) {
			// console.log("error");
			return (e); 
		}
		return ("connect");
	}

	
	//OK
	//Create new room with current socker user as admin
	//{room_name: string, is_password_protected: bool, room_password: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('new_room')
	async creat_room(@MessageBody() data: any, @Request() req, @ConnectedSocket() client : Socket)
	{
		try {
			// console.log("new room", data);
			const id_user = await this.mainServer.getIdUser(req);
			const is_password_protected : boolean = data.is_password_protected;
			// const password  : string = is_password_protected ? data.room_password : "";
			//const password = (is_password_protected) ? data.room_password : "";
			const password : string = is_password_protected ? await bcrypt.hash(data.room_password, 10) : "";
			const name : string = data.room_name;
			const date_creation : Date = new Date();
			const  querry = this.dataSource.createQueryRunner(); 
			try{
				const new_chat_room = new ChatRoomEntity();
				new_chat_room.id_public_room = (date_creation.getTime() / (10**7) + Math.random() * 10**7).toString().slice(0, 6);
				new_chat_room.name = name;
				new_chat_room.date_creation = date_creation;
				new_chat_room.is_password_protected = data.is_password_protected;
				new_chat_room.password = password;
				new_chat_room.is_private = data.is_private;
				const res_chat_room : any = await this.dataSource.getRepository(ChatRoomEntity).save(new_chat_room);
				const new_user_chat_room = new UserChatRoomEntity();
				new_user_chat_room.id_user = id_user;
				new_user_chat_room.room = res_chat_room.id_g;
				new_user_chat_room.is_admin = true;
				new_user_chat_room.is_owner = true;
				new_user_chat_room.is_banned = false;
				new_user_chat_room.is_muted = false;
				const res_user_chat_room = await this.dataSource.getRepository(UserChatRoomEntity).save(new_user_chat_room);
				await client.join(new_chat_room.id_public_room);
				// console.log("Create room finish");
				await client.emit("new_room_res", {	id_public_room: new_chat_room.id_public_room, room_name: name, is_password_protected: is_password_protected, is_admin: true, is_private: data.is_private	});
			} catch (e) {
				// console.log("Create room error");
				await client.emit("error_new_room", {error: "Room already exist"});
				throw new WsException("Room already exist");
			}
		}catch(e){}
	}
	//OK
	//Add user to a room 
	//{id_public_room: string, username: string, room_password? : string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('append_user_to_room')
	async append_user_to_room(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			let client_username_42 = data.username;
			if (client_username_42 == undefined)
				client_username_42 = user.username;
			const id_user : any = await this.mainServer.getIdUserByUsername(client_username_42);
			const id_room = await this.mainServer.getIdRoom(data);
			if (data.room_password == undefined)
				data.room_password = "";
			const room = await this.dataSource.getRepository(ChatRoomEntity).createQueryBuilder("room").
			where("room.id_g = :id ", {id: id_room}).getOne();
			
			let is_good_password = false;
			if (room.is_password_protected)
				is_good_password = (data.room_password === room.password);
			if (room.is_password_protected)
			 	is_good_password = await bcrypt.compare(data.room_password, room.password);

			const is_already_in = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userRoom").
			where("userRoom.room = :id and userRoom.id_user = :id_u", {id: id_room, id_u : id_user}).getOne();

			if (room.is_password_protected && (!is_good_password )) //Test password
			{
				if (is_already_in && is_already_in.is_admin) //Test if user is admin
				{
					// console.log("Error");
					await client.emit("error_append_user_to_room", {error: "Bad password"});
					return;
				}
			}
			if (is_already_in != undefined) //Client already in room => just make this room visible for him
			{
				if (is_already_in.is_banned && is_already_in.ban_end > new Date())
				{
					// console.log("Error");
					await client.emit("error_append_user_to_room", {error : "You are ban of this room"});
					return ;
				}
				const res = await this.dataSource.createQueryBuilder().update(UserChatRoomEntity)
				.where("id_user = :u AND room = :r", {u: id_user, r: id_room})
				.set({is_visible: true}).execute(); //UPDATE is_visible
				await client.leave(data.id_public_room); 		//JOIN ROOM (socket.io rooms)
				await client.join(data.id_public_room); 		//JOIN ROOM (socket.io rooms)
				this.server.to(data.id_public_room).emit("success_append_user_to_room", {id_public_room: room.id_public_room, room_name: room.name, username: client_username_42});
				//this.server.to(data.id_public_room).emit("append_user_to_room_res", {id_public_room: room.id_public_room, is_admin: false, username: user.username});
				return;
			}
			const res_user_chat_room = await this.dataSource.createQueryBuilder().insert().into(UserChatRoomEntity).values
			([ 
				{id_user: id_user, room: id_room, is_admin: false, is_banned: false, is_muted: false}
			]).execute(); //Add user to the room
			await client.join(data.id_public_room); 		//JOIN ROOM (socket.io rooms)
			this.server.to(data.id_public_room).emit("success_append_user_to_room", {id_public_room: room.id_public_room, room_name: room.name, username: client_username_42});
			//this.server.to(data.id_public_room).emit("append_user_to_room_res", {id_public_room: room.id_public_room, is_admin: false, username: user.username});
			// console.log("Append user to room finish");
			return;
		}
		catch(e){
			// console.log("Append message Error: bad data", data);
			throw new WsException("Bad data");
		}
	}
	//OK
	//Get all user for a room
	//{id_public_room: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_users_room')
	async get_users_room(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const id_user = await this.mainServer.getIdUser(req);
			const id_room = await this.mainServer.getIdRoom(data);
			try{
				const res_is_in_room = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userChat")
				.where("userChat.id_user = :u", {u : id_user})
				.andWhere("userChat.room = :r", {r: id_room})
				.getMany();
				if (!res_is_in_room.length)
				{
					await client.emit("error_get_users_room", {error: "You are not in this room"});
					throw new WsException("Not in the room");
				}
				if (res_is_in_room[0].is_banned && res_is_in_room[0].ban_end > new Date())
				{
					await client.emit("error_get_users_room", {error: "You are banned"});
					throw new WsException("Your are ban");
				}
				const res = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userChatRoomEntity")
				.innerJoin("userChatRoomEntity.room", "chatRoom")
				.innerJoin("userChatRoomEntity.id_user", "user")
				.select(["user.username", "userChatRoomEntity.is_admin","userChatRoomEntity.is_owner"])
				.where("chatRoom.id_g = :id and userChatRoomEntity.is_banned = FALSE and userChatRoomEntity.is_visible = TRUE", {id: id_room}).getMany();
				let end : any = [];
				for (let user of res)
				{
					let inter : any = user;
					inter.is_login = false; 
					if (this.mainServer.getUserConnectedByUsername(inter.username) != null)
						inter.is_login = true; 
					end.push(inter);
				}
				await client.emit('get_users_room_res', {users: end, id_public_room: data.id_public_room});
			} catch (e) {
				// console.log("get_users Error: bad data", e);
				await client.emit("error_get_users_room", {error: "Error data"});
			}
		}catch(e){
			// console.log("get_users Error: bad data");
			throw new WsException("Bad data");
		}
	}
	//OK
	//Get all messages in room (Error if current socket user is not in the room)
	//{id_public_room: string }
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_message_room')
	async getMessageRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req) 
	{
		try{
			const id_user = await this.mainServer.getIdUser(req);
			const id_room = await this.mainServer.getIdRoom(data);
			try{
				const res_is_in_room = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userChat")
				.where("userChat.id_user = :u", {u : id_user})
				.andWhere("userChat.room = :r", {r: id_room}).getMany();
				if (!res_is_in_room.length)
				{
					// console.log("Not in room Error");
					await client.emit("error_get_message_room", {error: "You are not in this room"});
					throw new WsException("Not in the room");
				}
				if (res_is_in_room[0].is_banned && res_is_in_room[0].ban_end > new Date())
				{
					await client.emit("error_get_message_room", {error: "You are banned"});
					throw new WsException("Your are ban");
				}
				const res = await this.dataSource.getRepository(MessageChatRoomEntity).createQueryBuilder("messageChatRoomEntity")
				.innerJoin("messageChatRoomEntity.id_chat_room", "chatRoom")
				.innerJoin("messageChatRoomEntity.id_user", "user")
				.select(["messageChatRoomEntity.content_message", "messageChatRoomEntity.date_message", "user.username", "chatRoom.id_public_room"])
				.where("chatRoom.id_g = :id", {id: id_room}).orderBy("messageChatRoomEntity.date_message", "ASC").getMany();
				await client.emit('get_message_room_res', {messages : res, id_public_room: data.id_public_room} )
				return;
			} catch (e) {
				// console.log("getMessage Error", e);
				throw new WsException("No message in this room");
			}
		} catch(e){
			// console.log("getMessage Error: bad data");
			throw new WsException("Bad data");
		}
	}
	//Get a page of messages in room (Error if current socket user is not in the room)
	//{id_public_room: string, page_number: number, size_page: number }
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_message_room_page')
	async getMessageRoomPage(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req) 
	{
		try{
			const id_user = await this.mainServer.getIdUser(req);
			const id_room = await this.mainServer.getIdRoom(data);
			try{
				const res_is_in_room = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userChat")
				.where("userChat.id_user = :u", {u : id_user})
				.andWhere("userChat.room = :r", {r: id_room}).getMany();
				if (!res_is_in_room.length)
					throw new WsException("Not in the room");
				if (res_is_in_room[0].is_banned && res_is_in_room[0].ban_end > new Date())
				{
					await client.emit("error_get_message_room_page", {error: "You are banned"});
					throw new WsException("Your are ban");
				}
				const res = await this.dataSource.getRepository(MessageChatRoomEntity).createQueryBuilder("messageChatRoomEntity")
				.innerJoin("messageChatRoomEntity.id_chat_room", "chatRoom")
				.innerJoin("messageChatRoomEntity.id_user", "user")
				.select(["messageChatRoomEntity.content_message", "messageChatRoomEntity.date_message", "user.username", "chatRoom.id_public_room"])
				.where("chatRoom.id_g = :id", {id: id_room}).orderBy("messageChatRoomEntity.date_message", "DESC")
				.offset((parseInt(data.page_number)) * parseInt(data.size_page))
				.limit(parseInt(data.size_page))
				.getMany();
				await client.emit('get_message_room_page_res', {messages : res.reverse(), id_public_room: data.id_public_room, page_number: data.page_number});
				//console.log("Page send", res);
			} catch (e) {
				// console.log("getMessage Error", e);
				throw new WsException("No message in this room");
			}
		}catch(e){
			// console.log("getMessage Error: bad data",e, data);
			throw new WsException("Bad data");
		}
	}

	//{id_message: number}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_message_by_id')
	async getOneMessageRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req){
		try{
			const res : any = await this.dataSource.getRepository(MessageChatRoomEntity).createQueryBuilder("messageChatRoomEntity")
			.innerJoin("messageChatRoomEntity.id_chat_room", "chatRoom")
			.innerJoin("messageChatRoomEntity.id_user", "user")
			.where("messageChatRoomEntity.id = :i", {i: data.id_message})
			.select(["messageChatRoomEntity.content_message", "messageChatRoomEntity.date_message", "user.username", "chatRoom.id_public_room"])
			.getOne();
			// console.log(res);
			await client.emit('get_message_by_id', {content_message: res.content_message, id_public_room: res.id_chat_room.id_public_room, username: res.id_user.username, date_message: res.date_message});
		}catch(e){}
	}

	//OK	
	//Add message in a room (Error if current socket user is not in the room)
	//{id_public_room: string, content_message: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('new_message_room')
	async newMessageRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try
		{
			const id_user = await this.mainServer.getIdUser(req);
			const id_room = await this.mainServer.getIdRoom(data);
			const message : any = data.content_message;
			const date_creation : Date = new Date();
			const user : any = await this.dataSource.getRepository(UserEntity).findOne({where: {id_g: id_user}});
			const client_username = user.username;
			const  querry = this.dataSource.createQueryRunner(); 
			try{
				const res = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userChat")
				.where("userChat.id_user = :u", {u : id_user})
				.andWhere("userChat.room = :r", {r: id_room}).getMany();
				if (!res.length)
					throw new WsException("Not in the room");
				if (res[0].is_banned && res[0].ban_end > new Date())
				{
					await client.emit("error_new_message_room", {error: "You are banned", id_public_room: data.id_public_room, ban_end: res[0].ban_end});
					throw new WsException("You are ban of the room");
				}
				if (res[0].is_muted && res[0].mute_end > new Date())
				{
					await client.emit("error_new_message_room", {error: "You are muted", id_public_room: data.id_public_room, mute_end: res[0].mute_end});
					throw new WsException("You are mute");
				}
				const newMessage = new MessageChatRoomEntity();
				newMessage.id_user = id_user;
				newMessage.id_chat_room = id_room;
				newMessage.content_message = message;
				newMessage.date_message = date_creation;
				const res_insert_message = await this.dataSource.getRepository(MessageChatRoomEntity).save(newMessage);
				//await querry.commitTransaction();
				this.server.to(data.id_public_room).emit('new_message_room', {id_public_room : data.id_public_room, content_message: data.content_message, username: client_username, date_message: date_creation});
				//this.server.to(data.id_public_room).emit('notification_new_message_room', {id_public_room : data.id_public_room, id_message: res_insert_message.id });
			} catch (e) {
				//await querry.rollbackTransaction();
				await client.emit("error_new_message_room", {error: "Can't create message"});
				throw new WsException("Can't send message");
				// console.log("Error Create message:", e)
			}
		}catch(e){}
	}
	//OK
	//Get all rooms for the current socket user
	//{}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_my_rooms')
	async getMyRoom(@MessageBody() data, @ConnectedSocket() client: Socket)
	{
		try
		{
			const res : any = await this.mainServer.getNamesRoomsForUser(client);
			await client.emit("get_my_rooms_res", res);
		}catch(e){}
	}

	//OK
	//Get all rooms in the databases
	//{}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_all_rooms')
	async getAllRooms(@MessageBody() data, @ConnectedSocket() client: Socket)
	{
		try{
		const res = await this.dataSource.getRepository(MessageChatRoomEntity)
		.createQueryBuilder("messages")
		.innerJoin("messages.id_chat_room", "room")
		.groupBy("room.id_g")
		.where("room.is_private = :p", {p: false})
		.select(["Sum(1) as nb_users", "room.id_public_room", "room.is_password_protected"]).getMany();

		// const res = await this.dataSource.getRepository(ChatRoomEntity)
		// .createQueryBuilder("chatRoom")
		// .where("chatRoom.is_private = :p", {p: false})
		// .select(["chatroom.id_public_room", "chatRoom.is_password_protected"]).getMany();
		// console.log("get_all_rooms: ", res)
		await client.emit("get_all_rooms_res", res);
		}catch(e){}
	}
	//OK
	//Get all rooms in the databases
	//{research: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_all_rooms_begin_by')
	async getAllRoomsBeginBy(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try
		{
			const id_user = await this.mainServer.getIdUser(req);

			let res: any;
			if (data.research[0] === '#') {
				res = await this.dataSource.createQueryRunner().query(
					"SELECT sum(1) as \"nb_users\", min(chat_room_entity.name) as name, \
					min(chat_room_entity.id_public_room) as id_public_room, bool_or(chat_room_entity.is_password_protected) as is_password_protected \
					FROM chat_room_entity left join user_chat_room_entity \
					on chat_room_entity.id_g = user_chat_room_entity.\"roomIdG\" \
					WHERE chat_room_entity.id_public_room = $1 \
					and chat_room_entity.id_g not in (select id from user_chat_room_entity where \"idUserIdG\" = $2 and user_chat_room_entity.is_visible = TRUE) \
					group by chat_room_entity.id_g",
					[data.research.slice(1), id_user]
				);
			} else {
				res = await this.dataSource.createQueryRunner().
					query("SELECT sum(1) as \"nb_users\", min(chat_room_entity.name) as name, \
						min(chat_room_entity.id_public_room) as id_public_room, bool_or(chat_room_entity.is_password_protected) as is_password_protected \
						FROM chat_room_entity left join user_chat_room_entity \
						on chat_room_entity.id_g = user_chat_room_entity.\"roomIdG\" \
						where chat_room_entity.is_private = FALSE  \
						and substr(chat_room_entity.name, 1, $1) = $2 \
						and chat_room_entity.id_g not in (select \"roomIdG\" as id_g from user_chat_room_entity where \"idUserIdG\" = $3 and user_chat_room_entity.is_visible = TRUE) \
						group by chat_room_entity.id_g", [data.research.length, data.research, id_user]);
			}
			// console.log(res, data)
			await client.emit("get_all_rooms_begin_by_res", res);
		}catch(e){}
	}


	//Ban a user if current socket user is Admin on the room 
	//{id_public_room:string, username_ban: string, ban_end: Date}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('ban_user')
	async setBanUser(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			let ban_end = data.ban_end;
			if (ban_end == undefined)
				ban_end = new Date(2999, 12, 31);
			data.ban_end = ban_end;
			const jwt : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			const user : any = await this.dataSource.getRepository(UserEntity).find({where: {username_42: jwt.username_42}});
			const user_ban : any = await this.dataSource.getRepository(UserEntity).find({where: {username: data.username_ban}});
			const room : any = await this.dataSource.getRepository(ChatRoomEntity).find({where: {id_public_room: data.id_public_room}});

			const is_admin = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userRoom")
			.where("userRoom.id_user = :u AND userRoom.room = :r", {u: user[0].id_g, r: room[0].id_g})
			.select("userRoom.is_admin").getMany();
			if (!is_admin[0].is_admin)
			{
				await client.emit("error_ban_user", {error: "You are not admin of the room"});
				throw new WsException("You are not admin");
			}
			else
			{
				const res = await this.dataSource.createQueryBuilder().update(UserChatRoomEntity)
				.set({is_banned: true, ban_end: ban_end})
				.where("id_user = :u AND room = :r", {u: user_ban[0].id_g, r: room[0].id_g})
				.execute();
				let client = await this.mainServer.getUserConnectedByUsername(data.username_ban)
				if (client)
					client.leave(data.id_public_room); 		//JOIN ROOM (socket.io rooms)
				this.server.to(data.id_public_room).emit("ban_user", data);
			}
		}catch(e){}
	}
	//OK
	//Mute a user if current socket user is Admin on the room 
	//{id_public_room:string, username_ban: string, mute_end: Date}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('mute_user')
	async setMuteUser(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			let mute_end = data.mute_end;
			if (mute_end == undefined)
				mute_end = new Date(2999, 12, 31);
			data.mute_end = mute_end;
			const jwt : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			const user : any = await this.dataSource.getRepository(UserEntity).find({where: {username_42: jwt.username_42}});
			const user_ban : any = await this.dataSource.getRepository(UserEntity).find({where: {username: data.username_ban}});
			const room : any = await this.dataSource.getRepository(ChatRoomEntity).find({where: {id_public_room: data.id_public_room}});
			const is_admin = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userRoom")
			.where("userRoom.id_user = :u AND userRoom.room = :r", {u: user[0].id_g, r: room[0].id_g})
			.select("userRoom.is_admin").getMany();
			if (!is_admin[0].is_admin)
			{
				await client.emit("error_ban_user", {error: "You are not admin of the room"});
				throw new WsException("You are not admin");
			}
			else
			{
				const res = await this.dataSource.createQueryBuilder().update(UserChatRoomEntity)
				.set({is_muted: true, mute_end: mute_end})
				.where("id_user = :u AND room = :r", {u: user_ban[0].id_g, r: room[0].id_g})
				.execute();
				this.server.to(data.id_public_room).emit("mute_user", data);
			}
		}catch(e){}
	}
	//OK
	//Set other user as admin if current socket user is Admin on the room 
	//{id_public_room:string, username_new_admin: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('set_admin')
	async setAdminUser(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const client_username : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			const user : any = await this.dataSource.getRepository(UserEntity).find({where: {username_42: client_username.username_42}});
			const user_ban : any = await this.dataSource.getRepository(UserEntity).find({where: {username: data.username_new_admin}});
			const room : any = await this.dataSource.getRepository(ChatRoomEntity).find({where: { id_public_room: data.id_public_room }} );

			const is_admin = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("userRoom")
			.where("userRoom.id_user = :u AND userRoom.room = :r", {u: user[0].id_g, r: room[0].id_g})
			.select("userRoom.is_admin").getMany();
			if (!is_admin[0].is_admin)
			{
				await client.emit("error_ban_user", {error: "You are not admin of the room"});
				throw new WsException("You are not admin");
			}
			else
			{
				const res = await this.dataSource.createQueryBuilder().update(UserChatRoomEntity)
				.where("id_user = :u AND room = :r", {u: user_ban[0].id_g, r: room[0].id_g})
				.set({is_admin: true, is_banned: false, is_muted: false}).execute();
				this.server.to(data.id_public_room).emit("set_admin", data);
			}
		}catch(e){}
	}
	//Put a room in state "note visible" for a user
	//{id_public_roomng}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage("set_room_not_visible")
	async setRoomNotVisible(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req) {
		try{
		// console.log("set_room_not_visible", data)
		const user = await this.mainServer.getIdUser(req);
		const user_jwt : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		const client_username = user_jwt.username;
		const room : any = await this.mainServer.getIdRoom(data);
		// console.log("set_room_not_visible", data, user, room);
		const res = await this.dataSource.createQueryBuilder().update(UserChatRoomEntity)
				.where("id_user = :u AND room = :r", {u: user, r: room})
				.set({is_visible: false, is_owner: false}).execute();
		//await client.emit("set_room_not_visible_res", data.id_public_room);
		this.server.to(data.id_public_room).emit("set_room_not_visible_res", {id_public_room : data.id_public_room, username: client_username });;
		}catch(e){
			// console.log("error data :", e);
		}
	}
	//Put a room in state "visible" for a user
	//{id_public_room:string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage("set_room_visible")
	async setRoomVisible(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req) {
		try{
			const client_username : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			const user : any = await this.dataSource.getRepository(UserEntity).find({where: {username: client_username.username_42}});
			const room : any = await this.dataSource.getRepository(ChatRoomEntity).find({where: {id_public_room: data.id_public_room}});
			const res = await this.dataSource.createQueryBuilder().update(UserChatRoomEntity)
					.where("id_user = :u AND room = :r", {u: user[0].id_g, r: room[0].id_g})
					.set({is_visible: true}).execute();
			await client.join(data.id_public_room);
			await client.emit("set_room_visible_res", {});
		}catch(e){}
	}
	//Put a room private
	//{id_public_room:string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage("set_room_private")
	async setRoomPrivate(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req) {
		try {
			const user : any = await this.mainServer.getIdUser(req);
			const room : any = await  this.mainServer.getIdRoom(data);
			const is_owner = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("u")
					.where("u.id_user = :u AND u.room = :r", {u: user, r: room})
					.select(["u.is_owner"]).getOne();
			if (is_owner.is_owner == false)
			{
				await client.emit("error_set_room_private_res", {error: "You are not owner of the room."});
				return ;
			}
			const res = await this.dataSource.createQueryBuilder().update(ChatRoomEntity)
					.where("id_g = :r", {r: room})
					.set({is_private: true}).execute();
			await client.emit("set_room_private_res", {id_public_room : data.id_public_room});
		}catch(e){}
	}
	//Put a room private
	//{id_public_room:string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage("unset_room_private")
	async unsetRoomPrivate(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req) {
		try {
			const client_username : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			const user : any = await this.mainServer.getIdUser(req);
			const room : any = await  this.mainServer.getIdRoom( data);
			const is_owner = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("u")
					.where("u.id_user = :u AND u.room = :r", {u: user, r: room})
					.select(["u.is_owner"]).getOne();
			if (is_owner.is_owner == false)
			{
				await client.emit("error_set_room_private_res", {error: "You are not owner of the room."});
				return ;
			}
			const res = await this.dataSource.createQueryBuilder().update(ChatRoomEntity)
					.where("id_g = :r", {r: room})
					.set({is_private: false}).execute();
			await client.emit("unset_room_private_res", {id_public_room : data.id_public_room});
		}catch(e){}
	}
	//{id_public_room:string, password:string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage("set_password_room")
	async setRoomPassword(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req) {
		try {
			const user : any = await this.mainServer.getIdUser(req);
			const room : any = await  this.mainServer.getIdRoom( data);
			const is_owner = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("u")
					.where("u.id_user = :u AND u.room = :r", {u: user, r: room})
					.select(["u.is_owner"]).getOne();
			if (is_owner.is_owner == false)
			{
				await client.emit("error_set_password_room", {error: "You are not owner of the room."});
				return ;
			}
			//const password = data.password;
			const password = await bcrypt.hash(data.password, 10);
			const res = await this.dataSource.createQueryBuilder().update(ChatRoomEntity)
					.where("id_g = :r", {r: room})
					.set({password: data.password, is_password_protected: true}).execute();
			await client.emit("set_password_room_res", {id_public_room : data.id_public_room});
		}catch(e){}
	}
	//Unset password room
	//{id_public_room:string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage("unset_password_room")
	async unsetRoomPassword(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req) {
		try {
			const client_username : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
			const user : any = await this.mainServer.getIdUser(req);
			const room : any = await  this.mainServer.getIdRoom( data);
			const is_owner = await this.dataSource.getRepository(UserChatRoomEntity).createQueryBuilder("u")
					.where("u.id_user = :u AND u.room = :r", {u: user, r: room})
					.select(["u.is_owner"]).getOne();
			if (is_owner.is_owner == false)
			{
				await client.emit("error_unset_password_room_res", {error: "You are not owner of the room."});
				return ;
			}

			const res = await this.dataSource.createQueryBuilder().update(ChatRoomEntity)
					.where("id_g = :r", {r: room})
					.set({is_password_protected: false}).execute();
			await client.emit("unset_password_room_res", {id_public_room : data.id_public_room});
		} catch(e) {}
	}
	//OK
	//{}
	//get email, username, img of current socket user
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_user_info')
	async get_user_infos(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const id_user = await this.mainServer.getIdUser(req);
			const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
						.where("id_g = :id", {id : id_user})
						.select(["user.email", "user.username", "user.username_42", "user.img", "user.img_url", "user.displayname", "user.campus_name", "user.campus_country", "user.is_2fa", "user.otpauthUrl_2fa", "user.created_at", "user.last_connection" ]).getOne();
        	const url = await toDataURL(res.otpauthUrl_2fa);
			res.otpauthUrl_2fa = url;
			await client.emit("get_user_info_res", res);
		}catch(e)
		{
			await client.emit("error_get_user_info", "User not found");
			throw new WsException("User not found");
		}
	}
	//OK
	//{username_search : string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_other_user_info')
	async get_other_user_infos(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		try{
			const id_user = await this.mainServer.getIdUserByUsername(data.username_search);
			const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
						.where("id_g = :id", {id : id_user})
						.select(["user.email", "user.username", "user.img", "user.img_url", "user.displayname", "user.campus_name", "user.campus_country", ]).getOne();
			await client.emit("get_other_user_info", res);
			return (res);
		}catch(e)
		{
			await client.emit("error_get_other_user_info", "User not found");
			throw new WsException("User not found");
		}
	}
	//{research: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('get_all_username_begin_by')
	async getAllUsernameBeginBy(@MessageBody() data, @ConnectedSocket() client: Socket)
	{
		try {
			const res = await this.dataSource.getRepository(UserEntity)
			.createQueryBuilder("user")
			.select(["user.username"])
			.where("substr(user.username, 1, :l) = :s", {l: data.research.length, s: data.research}).getMany();
			await client.emit("get_all_username_begin_by", res);
		} catch(e) {}
	}
	//{new_username: string}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('change_username')
	async newUsername(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try {
			const id_user = await this.mainServer.getIdUser(req);
			try{
				const res = await this.dataSource.getRepository(UserEntity)
				.createQueryBuilder("user")
				.select(["user.username"])
				.where("user.username = :u", {u: data.new_username}).getOneOrFail();
				await client.emit("error_change_username", "Username already taken");
				return;
			}catch(e){
				if (data.new_username.length == 0 || data.new_username.length > 20)
				{
					await client.emit("error_change_username", "Username not in good fromat");
					return;
				}
				const res = await this.dataSource.createQueryBuilder().update(UserEntity)
				.where("id_g = :u", {u: id_user})
				.set({username: data.new_username}).execute();
				this.mainServer.updateUsernameBySocketId(client.id, data.new_username);
				await client.emit("change_username_res", {new_username: data.new_username});
				return;
			}
		}catch(e){
			await client.emit("error_change_username", "Data error");
		}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('try_active_double_auth')
	async tryActiveDoubleAuth(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try {
			const id_user = await this.mainServer.getIdUser(req);
			const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
			.where("id_g = :id", {id : id_user})
			.select(["user.otpauthUrl_2fa"]).getOne();

			let url = await toDataURL(res.otpauthUrl_2fa);
			await client.emit("try_active_double_auth_res", url);
		} catch(e) {
			await client.emit("try_error_active_double_auth", {});
		}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('active_double_auth')
	async activeDoubleAuth(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try {
			const id_user = await this.mainServer.getIdUser(req);
			const res_update = await this.dataSource.createQueryBuilder().update(UserEntity)
			.where("id_g = :u", {u: id_user})
			.set({is_2fa: true}).execute();

			await client.emit("active_double_auth_res");
		}catch(e) {
			await client.emit("error_active_double_auth", {});
		}
	}
	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('disable_double_auth')
	async disableDoubleAuth(@MessageBody() data, @ConnectedSocket() client: Socket, @Request() req)
	{
		try {
			const id_user = await this.mainServer.getIdUser(req);
			const res_update = await this.dataSource.createQueryBuilder().update(UserEntity)
			.where("id_g = :u", {u: id_user})
			.set({is_2fa: false}).execute();
			await client.emit("disable_double_auth_res", {});
		}catch(e){
			await client.emit("error_disable_double_auth", {});
		}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('verify2FAKey')
	async verify2FAKey(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req) {
	  try {
		// Get the user's secret key from the database
		const id_user = await this.mainServer.getIdUser(req);
		const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
			.where("id_g = :id", {id : id_user})
			.select(["user.secret_2fa"]).getOne();

		const valid = authenticator.verify({ secret: res.secret_2fa, token: data });
		await client.emit('verify2FAKeyRes', { res: valid });

	  } catch (e) {
		await client.emit('error_verify2FAKey', {});
	  }
	}
}