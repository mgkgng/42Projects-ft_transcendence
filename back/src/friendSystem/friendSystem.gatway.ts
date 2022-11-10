import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { ChatRoomEntity } from "src/entity/ChatRoom.entity";
import { MessageChatRoomEntity } from "src/entity/MessageChatRoom.entity";
import { DataSource } from "typeorm";
import { MainServerService } from "../mainServer/mainServer.gateway";
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { friendSystemService } from "./friendSystem.service";

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
		private friendService : friendSystemService
	){
	}
	@WebSocketServer() server;

	async handleConnection(@Request() req)
	{
	}

	//{username_to_ask: string}
	@SubscribeMessage('askFriend')
	askFriend(@ConnectedSocket() client: Socket, @Request() req, @MessageBody() data)
	{
		try
		{
			let username = this.jwtServer.verify(req.cookies['jwt']).username;
			let username_to_ask = this.mainServer.getIdUser(data.username_to_ask); //check if the other user exit
			this.friendService.askFriend(username, data.username_to_ask);
			client.emit('askFriend', {username_to_ask: data.username_to_ask});
		} catch(e)
		{
			client.emit('error_askFriend', {error: "Cannot add this user"});
		}
	}
	//{username_to_unask: string}
	@SubscribeMessage('unaskFriend')
	unaskFriend(@ConnectedSocket() client: Socket, @Request() req, @MessageBody() data)
	{
		try
		{
			let username = this.jwtServer.verify(req.cookies['jwt']).username;
			let username_to_ask = this.mainServer.getIdUser(data.username_to_unask); //check if the other user exit
			this.friendService.askFriend(username, data.username_to_unask);
			client.emit('unaskFriend', {username_to_unask: data.username_to_unask});
		}catch(e)
		{
			client.emit('error_unaskFriend', {error: "Cannot unask this user"});
		}
	}
	//{username_to_unFriend: string}
	@SubscribeMessage('unFriend')
	unFriend(@ConnectedSocket() client: Socket, @Request() req, @MessageBody() data)
	{
		try
		{
			let username = this.jwtServer.verify(req.cookies['jwt']).username;
			let username_to_ask = this.mainServer.getIdUser(data.username_to_unFriend); //check if the other user exit
			this.friendService.askFriend(username, data.username_to_unFriend);
			client.emit('unFriend', {username_to_unFriend: data.username_to_unFriend});
		}catch(e)
		{
			client.emit('error_unFriend', {error: "Cannot unFriend this user"});
		}
	}
	//{}
	@SubscribeMessage('getFriendList')
	getFriendList(@ConnectedSocket() client: Socket, @Request() req, @MessageBody() data)
	{
		let username = this.jwtServer.verify(req.cookies['jwt']).username;
		const res = this.friendService.getFriendList(username);
		client.emit("getFriendList", {list: res});
	}
	//{}
	@SubscribeMessage('getAskList')
	getAskList(@ConnectedSocket() client: Socket, @Request() req, @MessageBody() data)
	{
		let username = this.jwtServer.verify(req.cookies['jwt']).username;
		const res = this.friendService.getFriendList(username);
		client.emit("getFriendList", {list: res});
	}
}
