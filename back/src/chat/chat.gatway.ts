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

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class ChatService {
	constructor(
		@InjectRepository(UserEntity) 
		private userRepository: Repository<UserEntity>,
		private dataSource : DataSource,
		private jwtServer: JwtService
){}
	@WebSocketServer() server;

	after_init(){
		console.log('init');
		return ({"create" : "bite"});
	}

  	@UseGuards(AuthGuard('jwt'))
	async handleConnection(@Request() req)
	{
		const client : Socket = req;
		console.log('Connect');
		const names = await this.getNamesRoomsForUser(req);
		for (let n of names)
		{
			const name : string = n.room.name;
			client.join(name);
			console.log("Join => ", n.room.name);
		}
		return ("connect");
	}

	handleDisconnect()
	{
		console.log('Disconnect');
	}

	async getIdUser(@Request() req){
		const user : any = (this.jwtServer.decode(req.handshake.headers.authorization.split(' ')[1]));
		const client_username = user.username;
		const id_user : any = await this.dataSource.getRepository(UserEntity)
		.createQueryBuilder().where("UserEntity.username = :u", { u: client_username }).getOneOrFail();
		return (id_user.id_g);
	}

	async getIdRoom (@MessageBody() name){
		const id_user : any = await this.dataSource.getRepository(ChatRoomEntity)
		.createQueryBuilder().where("ChatRoomEntity.name = :u", { u: name.room_name}).getOneOrFail();
		return (id_user.id_g);
	}

	async getNamesRoomsForUser(@Request() req){
		const id_user = await this.getIdUser(req);	
		const names_rooms : any = await this.dataSource.getRepository(UserChatRoomEntity)
		.createQueryBuilder("userRooms").innerJoinAndSelect("userRooms.room", "chatRoom")
		.where("userRooms.id_user = :u", { u: id_user })
		.select(["userRooms.id", "chatRoom.name"]).getMany();
		return (names_rooms);
	}

	@SubscribeMessage('new_room')
	async creat_room(@MessageBody() data: any, @Request() req)
	{
		//NAME, IS_PASSWORD_PROTECTED, PASSWORD
		const id_user = await this.getIdUser(req);
		const is_password_protected : boolean = data.is_password_protected;	
		const password : string = is_password_protected ? data.password : "";
		const name : string = data.room_name;
		const date_creation : Date = new Date();
		const  querry = this.dataSource.createQueryRunner(); 
		await querry.connect();
		await querry.startTransaction();
		try{
			const res_chat_room = await querry.manager.insert(ChatRoomEntity,
				{name: name, date_creation: date_creation, is_password_protected: is_password_protected, password: password}
			);
			console.log(res_chat_room);
			console.log(res_chat_room.identifiers[0].id_g);
			const res_user_chat_room = await querry.manager.insert(UserChatRoomEntity, 
				{id_user: id_user, room: res_chat_room.identifiers[0].id_g, is_admin: true, is_banned: false, is_muted: false}
			);
			await querry.commitTransaction();
			const client : Socket = req;
			client.join(name);
			console.log("Create room finish");
		} catch (e) {
			await querry.rollbackTransaction();
			console.log("Create room error");
			throw new WsException("Room already exist");
		}
	}

	@SubscribeMessage('get_message_room')
	async getMessageRoom(@MessageBody() data: number, @ConnectedSocket() client: Socket, @Request() req) 
	{
		try{
			const id_user = await this.getIdUser(req);
			const id_room = await this.getIdRoom(data);
			try{
				const res = await this.dataSource.getRepository(MessageChatRoomEntity).createQueryBuilder("messageChatRoomEntity")
				.innerJoin("messageChatRoomEntity.id_chat_room", "chatRoom")
				.innerJoin("messageChatRoomEntity.id_user", "user")
				.select(["messageChatRoomEntity.content_message", "messageChatRoomEntity.date_message", "user.username", "chatRoom.name"])
				.where("chatRoom.id_g = :id", {id: id_room}).orderBy("messageChatRoomEntity.date_message", "DESC").getMany();
				console.log(res);
			} catch (e) {
				console.log("getMessage Error");
				console.log(e);
				throw new WsException("No message in this room");
			}
		}catch(e){
			console.log("getMessage Error: bad data");
			throw new WsException("Bad data");
		}
	}

	@SubscribeMessage('new_message_room')
	async newMessageRoom(@MessageBody() data: any, @ConnectedSocket() client: Socket, @Request() req)
	{
		//NAME, IS_PASSWORD_PROTECTED, PASSWORD
		const id_user = await this.getIdUser(req);
		const id_room = await this.getIdRoom(data);
		const message : any = data.message;
		const date_creation : Date = new Date();
		const  querry = this.dataSource.createQueryRunner(); 
		await querry.connect();
		await querry.startTransaction();
		try{
			const res_insert_message = await querry.manager.insert(MessageChatRoomEntity,
				{ id_user: id_user, id_chat_room: id_room, content_message: message, date_message: date_creation}
			);
			console.log(res_insert_message);
			await querry.commitTransaction();
			this.server.to(data.room_name).emit('new_message_room', data);
			console.log("Create message finish");
		} catch (e) {
			await querry.rollbackTransaction();
			console.log("Can't create message");
			throw new WsException("Can't send message");
		}
	}

	@SubscribeMessage('pute')
	handleEvent(@MessageBody('data') data: string, @ConnectedSocket() client: Socket): string {
		return (data);
	}
	
}

