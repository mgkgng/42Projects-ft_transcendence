import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Socket } from 'socket.io';
import { ChatRoomEntity } from "src/entity/ChatRoom.entity";
import { MessageChatRoomEntity } from "src/entity/MessageChatRoom.entity";
import { DataSource } from "typeorm";
import { MainServerService } from "src/mainServer/mainServer.service";
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

	@SubscribeMessage('getFriendList')
	async getFriendList(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		if (!user)
		{
			this.server.to(client.id).emit('error_getFriendList', {error: "User not found"});
			return;
		}
		const friends = await this.friendSystemService.getFriendList(user.username);
		if (!friends)
		{
			this.server.to(client.id).emit('error_getFriendList', {error: "No friends found"});
			return;
		}
		let parsedList = [];
		parsedList = friends.map((friend) => {
			return {username: friend.username, username_42: friend.username_42, displayname: friend.displayname, campus_name: friend.campus_name, campus_country: friend.campus_country, img_url: friend.img_url, created_at: friend.created_at, last_connection: friend.last_connection, status: this.mainServerService.getUserConnectedByUsername(friend.username) ? true : false};
		});
		this.server.to(client.id).emit('success_getFriendList', {friends: parsedList});
		return;
	}

	@SubscribeMessage('getUserProfile')
	async getUserProfile(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		// const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const id_user = await this.mainServerService.getIdUserByUsername(data.username);
		const res = await this.dataSource.getRepository(UserEntity).createQueryBuilder("user")
					.where("id_g = :id", {id : id_user})
					.select(["user.email", "user.username", "user.img", "user.img_url", "user.displayname", "user.campus_name", "user.campus_country", "user.is_2fa", "user.otpauthUrl_2fa" ]).getOne();
		client.emit("resUserProfile", res)
	}

	@SubscribeMessage('getAskList')
	async getAskedFriendList(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		if (!user)
		{
			this.server.to(client.id).emit('error_getAskList', {error: "User not found"});
			return;
		}
		// return the list of user who ask to be friend with the user
		const friends = await this.friendSystemService.getAskListWhereUserIsAsked(user.username);
		if (!friends)
		{
			this.server.to(client.id).emit('success_getAskList', {friends: []});
			return ;	
			// A mon avis, if friends == null, ce serait parce que la liste est vide. mais ça reste néanmoins une réussite?
			// this.server.to(client.id).emit('error_getAskList', {error: "No asker found"});
			// return;
		}
		const parsedList = friends.map((friend) => {
			return {username: friend.username, username_42: friend.username_42, displayname: friend.displayname, campus_name: friend.campus_name, campus_country: friend.campus_country, img_url: friend.img_url, created_at: friend.created_at, last_connection: friend.last_connection, status: this.mainServerService.getUserConnectedByUsername(friend.username) ? true : false};
		});
		this.server.to(client.id).emit('success_getAskList', {friends: parsedList});
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
		const userAskList = await this.friendSystemService.getAskList(user.username);
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		if (userAskList.find((user) => user.username == friend.username) || userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_askFriend', {error: "User already asked as friend"});
			return;
		}
		else
		{
			const userFriend = await this.friendSystemService.askFriend(user.username, friend.username);
			const friendSocketId = this.mainServerService.getUserConnectedByUsername(friend.username);
			if (friendSocketId)
			{
				let emitList = this.mainServerService.getUserConnectedListBySocketId(friendSocketId.id);
				emitList.forEach((user) => {
					this.server.to(user.id).emit('askFriendNotification', {friend: userFriend});
				})
			}
			this.server.to(client.id).emit('success_askFriend', {friend: friend.username});
			return;
		}
	}

	@SubscribeMessage('unAskFriend')
	async unAskFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const friend = await this.userRepository.findOne({where: {username: data.username}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_unAskFriend', {error: "User not found"});
			return;
		}
		const userAskerList = await this.friendSystemService.getAskListWhereUserIsAsker(user.username);
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		if (userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_unAskFriend', {error: "User already friend"});
			return;
		}
		else if (!userAskerList || !userAskerList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_unAskFriend', {error: "User not asked as friend or refused"});
			return;
		}
		else
		{
			await this.friendSystemService.unAskFriend(user.username, friend.username);
			this.server.to(client.id).emit('success_unAskFriend', {friend: friend.username});
			return;
		}
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
		const FriendAskList = await this.friendSystemService.getAskList(friend.username);
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		if (userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_acceptFriend', {error: "User already accepted as friend"});
			return;
		}
		else if (!FriendAskList.find((user) => user.username == user.username))
		{
			this.server.to(client.id).emit('error_acceptFriend', {error: "User doesnt asked you as friend"});
			return;
		}
		else
		{
			const userFriend = await this.friendSystemService.askFriend(user.username, friend.username);
			this.server.to(client.id).emit('success_acceptFriend', {friend: friend.username});
			return;
		}
	}

	@SubscribeMessage('refuseFriend')
	async refuseFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const friend = await this.userRepository.findOne({where: {username: data.username}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_refuseFriend', {error: "User not found"});
			return;
		}
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		const userAskList = await this.friendSystemService.getAskList(user.username);
		if (userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_refuseFriend', {error: "User already accepted as friend"});
			return;
		}
		else if (!userAskList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_refuseFriend', {error: "User doesnt asked you as friend or has been refused"});
			return;
		}
		else
		{
			const userFriend = await this.friendSystemService.refuseFriend(friend.username, user.username);
			if (!userFriend)
			{
				this.server.to(client.id).emit('error_refuseFriend', {error: "Unknown error while refusing friend"});
				return;
			}
			this.server.to(client.id).emit('success_refuseFriend', {friend: friend.username});
			return;
		}
	}

	@SubscribeMessage('removeFriend')
	async removeFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		const user = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}});
		const friend = await this.userRepository.findOne({where: {username: data.username}});
		if (!user || !friend)
		{
			this.server.to(client.id).emit('error_removeFriend', {error: "User not found"});
			return;
		}
		const userFriendList = await this.friendSystemService.getFriendList(user.username);
		if (!userFriendList.find((user) => user.username == friend.username))
		{
			this.server.to(client.id).emit('error_removeFriend', {error: "User is not your friend"});
			return;
		}
		else
		{
			const userFriend = await this.friendSystemService.removeFriend(user.username, friend.username);
			if (!userFriend)
			{
				this.server.to(client.id).emit('error_removeFriend', {error: "Unknown error while removing friend"});
				return;
			}
			this.server.to(client.id).emit('success_removeFriend', {friend: friend.username});
			return;
		}
	}

	@SubscribeMessage('unblockUser')
	async unblockUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
	  try {
		const success = await this.friendSystemService.unblockUser(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username);
		this.server.to(client.id).emit('success_unblockUser', {success: true});
	  } catch (error) {
		this.server.to(client.id).emit('error_unblockUser', {error: error.message});
	  }
	}

	@SubscribeMessage('blockUser')
	async blockUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
	  try {
		const success = await this.friendSystemService.blockUser(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username);
		this.server.to(client.id).emit('success_blockUser', {success: true});
	  } catch (error) {
		this.server.to(client.id).emit('error_blockUser', {error: error.message});
	  }
	}

	@SubscribeMessage('isUserBlocked')
	async isUserBlocked(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
	  try {
		const success = await this.friendSystemService.isUserBlocked(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username);
		this.server.to(client.id).emit('success_isUserBlocked', {success: true, isUserBlocked: success});
	  } catch (error) {
		this.server.to(client.id).emit('error_isUserBlocked', {error: error.message});
	  }
	}
}
