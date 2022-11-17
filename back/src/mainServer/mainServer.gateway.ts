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
	){
	}
	@WebSocketServer() server;

	@UseGuards(AuthGuard("jwt"))
	handleConnection(@Request() req)
	{
		console.log("Connect to main");
		const user : any = (this.jwtServer.decode(req.handshake?.headers?.authorization.split(' ')[1]));
		const client_username : string = user?.username_42;
		let userConnected = {username: client_username, socket: req, status: "online"};
		this.mainServerService.userConnectedList.push(userConnected);
		// console.log(this.mainServerService.userConnectedList);
	}

	handleDisconnect(@Request() req)
	{
		for (let i = 0; i < this.mainServerService.userConnectedList.length; i++)
		{
			if (this.mainServerService.userConnectedList[i].socket === req)
			{
				// console.log(`User ${this.mainServerService.userConnectedList[i].username} deleted`);
				this.mainServerService.userConnectedList.splice(i, 1);
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
			console.log("ERROR GET USER IN DB");
			this.server.to(client.id).emit('error_getUserinDB', {error: "No user found"});
			return;
		}
		else
		{
			const parsedList = users.map((user) => {
				return {username: user.username, img_url: user.img_url, status: this.mainServerService.getUserStatus(user.username)}});
			const index = parsedList.indexOf(this.mainServerService.getUserConnectedBySocketId(client.id).username);
			if (index > -1) {
				parsedList.splice(index, 1);
			}
			this.server.to(client.id).emit('success_getUserinDB', {users: parsedList});
			return;
		}
	}
	
}