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
		const client_username : string = user?.username;
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
			const promiseParsedList = users.map( async (user) => {
				let isUserFriendWithConnectedUser = await this.friendSystemService.isFriendWithByUsernameGetEnt(this.mainServerService.getUserConnectedBySocketId(client.id).username, user.username);
				let isUserAskedByConnectedUser = await (await this.friendSystemService.getAskList(user.username)).find((ask) => ask.username === this.mainServerService.getUserConnectedBySocketId(client.id).username);
				return {username: user.username, username_42: user.username_42, displayname: user.displayname, img_url: user.img_url,
					campus_name: user.campus_name, campus_country: user.campus_country,
					last_connection: user.last_connection, created_at: user.created_at,
					status: this.mainServerService.getUserStatus(user.username),
					is_friend: isUserFriendWithConnectedUser ? true : false,
					is_asked: isUserAskedByConnectedUser ? true : false
				}});
			const parsedList = await Promise.all(promiseParsedList);
			const index = parsedList.indexOf(this.mainServerService.getUserConnectedBySocketId(client.id).username);
			if (index > -1) {
				parsedList.splice(index, 1);
			}
			// console.log(parsedList);
			this.server.to(client.id).emit('success_getUserinDB', {users: parsedList});
			return;
		}
	}

	// @SubscribeMessage('notification')
	// async getNotification(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
	// 	const userConnected = this.mainServerService.getUserConnectedBySocketId(client.id);
	// 	const userSender = await this.userRepository.findOne({where: {username: userConnected.username}});
	// 	// verify that data.user exist
	// 	const user = await this.userRepository.findOne({where: {username: data.user}});
	// 	if (!userConnected || !user)
	// 		return;
	// 	if (data.type === "ask")
	// 	{
	// 		let ret = await this.mainServerService.getNotificationListByUsernameAndDelete(userConnected.username);
	// 		this.server.to(client.id).emit('notification', {...ret});
	// 	}
	// 	else if (data.type === "directMessage")
	// 	{
	// 		if (data.user != userConnected.username && !(await this.friendSystemService.isUserBlocked(user.username, userSender.username)))
	// 		{
	// 			let emitList = await this.mainServerService.getUserConnectedListBySocketId(this.mainServerService.getUserConnectedByUsername(data.user).socket.id);
	// 			if (!emitList)
	// 			{
	// 				await this.mainServerService.addNotification(data.user, "directMessage", {});
	// 				return ;
	// 			}
	// 			for (let i = 0; i < emitList.length; i++)
	// 			{
	// 				this.server.to(emitList[i]).emit('notification', ...(await this.mainServerService.getNotificationListByUsernameAndDelete(userConnected.username)));
	// 			}
	// 		}
	// 	}
	// }
}