import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Repository, DataSource } from 'typeorm';
import { UserEntity } from 'src/entity/User.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class ChatService {
	constructor(
		//private usersRepository: Repository<UserEntity>, 
		//private chatRoomRepository: Repository<ChatRoomEntity>, 
		//private userChatRoomRepository: Repository<UserChatRoomEntity>, 
		private dataSource : DataSource
){}
	@WebSocketServer() server;

	after_init(){
		console.log('init');
		return ({"create" : "bite"});
	}

  	@UseGuards(AuthGuard('jwt'))
	handleConnection()
	{
		console.log('Connect');
		return ("connect");
	}

	handleDisconnect()
	{
		console.log('Disconnect');
	}

  	@UseGuards(AuthGuard('jwt'))
	@SubscribeMessage('new_msg_room')
	async handleMessageRoom(@MessageBody('roomId') data: number, @ConnectedSocket() client: Socket, @Request() req) 
	{
		console.log(req.username);
		const id_user = await this.dataSource.createQueryBuilder().select("id_g").from(UserEntity, "UserEntity").where("UserEntity.username = :username", { username: req.username }).getOne();
		console.log(id_user);
		const res =  await this.dataSource.createQueryBuilder().select("id_g").innerJoin("UserEntity.id1", "id_join");
		console.log(res);
	}

	@SubscribeMessage('pute')
	handleEvent(@MessageBody('data') data: string, @ConnectedSocket() client: Socket): string {
		return (data);
	}
	
}

