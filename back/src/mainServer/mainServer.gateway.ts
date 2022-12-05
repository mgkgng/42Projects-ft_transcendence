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
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Like } from 'typeorm';
import { MainServerService } from "src/mainServer/mainServer.service";
import { Inject } from '@nestjs/common';
import { friendSystemService } from 'src/friendSystem/friendSystem.service';

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
//@WebSocketGateway(3001)
export class MainServerGateway {
	constructor(
		private dataSource : DataSource,
		private jwtServer: JwtService,
		@InjectRepository(UserEntity)
		private userRepository : Repository<UserEntity>,
		@Inject(MainServerService)
		private mainServerService : MainServerService,
		@Inject(friendSystemService)
		private friendSystemService : friendSystemService
	){
	}
	@WebSocketServer() server;

	@UseGuards(AuthGuard("jwt"))
	handleConnection(@Request() req)
	{
		const user : any = (this.jwtServer.decode(req.handshake?.headers?.authorization.split(' ')[1]));
		const client_username : string = user?.username_42;
		let userConnected = {username: client_username, socket: req, status: "online"};
		global.userConnectedList.push(userConnected);
		this.userRepository.update({username: client_username}, {last_connection: new Date()});
	}

	handleDisconnect(@Request() req)
	{
		for (let i = 0; i < global.userConnectedList.length; i++)
		{
			if (global.userConnectedList[i].socket === req)
			{
				global.userConnectedList.splice(i, 1);
			}
		}
	}

	after_init()
	{
	}

	@SubscribeMessage('getUserinDB')
	async getUserinDB(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		if (data.username.length < 1)
			return;
		const users = await this.userRepository.find({where: {username: Like(data.username + "%")}, take: 8});
		if (!users || users.length < 1)
		{
			this.server.to(client.id).emit('error_getUserinDB', {error: "No user found"});
			return;
		}
		else
		{
			const parsedList = users.map( async (user) => {
				let isUserAskedByConnectedUser = (await this.friendSystemService.getAskList(user.username)).find((ask) => ask.username === data.username);
				let isUserFriendWithConnectedUser = (await this.friendSystemService.getFriendList(user.username)).find((friend) => friend.username === data.username);
				return {username: user.username, displayname: user.displayname, img_url: user.img_url,
					campus_name: user.campus_name, campus_country: user.campus_country,
					last_connection: user.last_connection, created_at: user.created_at,
					status: this.mainServerService.getUserStatus(user.username),
					is_friend: isUserFriendWithConnectedUser ? true : false,
					is_asked: isUserAskedByConnectedUser ? true : false}});
			const index = parsedList.indexOf(this.mainServerService.getUserConnectedBySocketId(client.id).username);
			if (index > -1) {
				parsedList.splice(index, 1);
			}
			this.server.to(client.id).emit('success_getUserinDB', {users: parsedList});
			return;
		}
	}
	
}