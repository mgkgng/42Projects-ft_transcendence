import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { ChatRoomEntity } from "src/entity/ChatRoom.entity";
import { MessageChatRoomEntity } from "src/entity/MessageChatRoom.entity";
import { DataSource } from "typeorm";
import { MainServerService } from "../mainServer/mainServer.gateway";
import { UseGuards, Request, HttpException } from '@nestjs/common';
import { friendSystemService } from "./friendSystem.service";
import { Inject } from "@nestjs/common";
import { UserEntity } from "src/entity/User.entity";
import { UserFriendEntity } from "src/entity/UserFriend.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class friendSystemGateway {
	constructor(
		private dataSource : DataSource,
		private jwtServer: JwtService,
		@InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(UserFriendEntity)
        private userFriendRepository : Repository<UserFriendEntity>,
        @Inject(friendSystemService)
        private friendSystemService : friendSystemService,
        @Inject(MainServerService)
        private mainServerService : MainServerService
	){
	}

	@WebSocketServer() server;

	@SubscribeMessage('isFriendWith')
	async isFriendWith(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const friend = await this.userRepository.findOne({where: {username: data.username}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_isFriendWith', {error: "User not found"});
			return;
		}
		const userFriend = await this.friendSystemService.isFriendWithByUsername(user.username, friend.username);
		if (!userFriend)
		{
			this.server.to(client.id).emit('error_isFriendWith', {error: "Users not asked as friend"});
			return;
		}
		this.server.to(client.id).emit('success_isFriendWith', {isFriend: userFriend.is_user_friend});
		return;
	}

	@SubscribeMessage('getFriendList')
	async getFriendList(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		
		console.log("coucou");
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		if (!user)
		{
			console.log("User not found");
			this.server.to(client.id).emit('error_getFriendList', {error: "User not found"});
			return;
		}
		const friends = await this.friendSystemService.getFriendList(user.username);
		if (!friends)
		{
			console.log("No friend found");
			this.server.to(client.id).emit('error_getFriendList', {error: "No friends found"});
			return;
		}
		console.log("Friends found");
		// this.server.to(client.id).emit('success_getFriendList', {friends: friends});
		client.emit('success_getFriendList', {friends: friends});
		return;
	}

	@SubscribeMessage('getAskFriendList')
	async getAskedFriendList(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		if (!user)
		{
			this.server.to(client.id).emit('error_getAskList', {error: "User not found"});
			return;
		}
		const friends = await this.friendSystemService.getAskList(user.username);
		if (!friends)
		{
			this.server.to(client.id).emit('error_getAskList', {error: "No asker found"});
			return;
		}
		this.server.to(client.id).emit('success_getAskList', {friends: friends});
		return;
	}

	@SubscribeMessage('askFriend')
	async askFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const friend = await this.userRepository.findOne({where: {username: data.username}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_askFriend', {error: "User not found"});
			return;
		}
		const userFriend = await this.friendSystemService.askFriend(user.username, friend.username);
		if (!userFriend)
		{
			this.server.to(client.id).emit('error_askFriend', {error: "User already asked as friend"});
			return;
		}
		this.server.to(client.id).emit('success_askFriend', {friend: friend.username});
		return;
	}

	@SubscribeMessage('acceptFriend')
	async acceptFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const friend = await this.userRepository.findOne({where: {username: data.username}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_acceptFriend', {error: "User not found"});
			return;
		}
		const userFriend = await this.friendSystemService.askFriend(user.username, friend.username);
		if (userFriend && userFriend.is_user_friend)
		{
			this.server.to(client.id).emit('success_acceptFriend', {friend: friend.username});
			return;
		}
		this.server.to(client.id).emit('error_acceptFriend', {error: "User not asked as friend"});
		return;
	}

	// @SubscribeMessage('refuseFriend')
	// async refuseFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
	// 	const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
	// 	const friend = await this.userRepository.findOne({where: {username: data.username}});
	// 	if (!user || !friend)
	// 	{
	// 		this.server.to(client.id).emit('error_refuseFriend', {error: "User not found"});
	// 		return;
	// 	}
	// 	const userFriend = await this.friendSystemService.unAskFriend(user.username, friend.username);
	// 	if (userFriend && !userFriend.is_user_friend)
	// 	{
	// 		this.server.to(client.id).emit('success_refuseFriend', {friend: friend.username});
	// 		return;
	// 	}
	// 	this.server.to(client.id).emit('error_refuseFriend', {error: "User not friend"});
	// 	return;
	// }
}
