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
import { WsThrottlerGuard } from "src/auth/reate_limitter" 


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

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('getFriendList')
	async getFriendList(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			if (!user)
			{
				this.server.to(client.id).emit('error_getFriendList', {error: "User not found SEXXX"});
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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('getUserProfile')
	async getUserProfile(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try{
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const target = await this.userRepository.findOne({where: {username_42: data.username_42}});

			let isUserFriendWithConnectedUser = await this.friendSystemService.isFriendWithByUsernameGetEnt(user.username, target.username);
			let isUserAskedByConnectedUser = await (await this.friendSystemService.getAskList(user.username)).find((ask) => ask.username === target.username);
			client.emit("resUserProfile", {username: target.username, username_42: target.username_42, displayname: target.displayname, img_url: target.img_url,
				campus_name: target.campus_name, campus_country: target.campus_country,
				last_connection: target.last_connection, created_at: target.created_at,
				status: this.mainServerService.getUserConnectedByUsername42(target.username_42) ? "online" : "offline",
				is_friend: isUserFriendWithConnectedUser ? true : false,
				is_asked: isUserAskedByConnectedUser ? true : false,
				asked_by: isUserAskedByConnectedUser ? isUserAskedByConnectedUser.username_42 : undefined
			});
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('getUserProfileByUsername')
	async getUserProfileByUsername(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try{
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const target = await this.userRepository.findOne({where: {username: data.username}});

			let isUserFriendWithConnectedUser = await this.friendSystemService.isFriendWithByUsernameGetEnt(user.username, target.username);
			let isUserAskedByConnectedUser = await (await this.friendSystemService.getAskList(user.username)).find((ask) => ask.username === target.username);
			client.emit("resUserProfileByUsername", {username: target.username, username_42: target.username_42, displayname: target.displayname, img_url: target.img_url,
				campus_name: target.campus_name, campus_country: target.campus_country,
				last_connection: target.last_connection, created_at: target.created_at,
				status: this.mainServerService.getUserConnectedByUsername42(target.username_42) ? "online" : "offline",
				is_friend: isUserFriendWithConnectedUser ? true : false,
				is_asked: isUserAskedByConnectedUser ? true : false,
				asked_by: isUserAskedByConnectedUser ? isUserAskedByConnectedUser.username_42 : undefined
			});
		}catch(e){}
	}


	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('getAskList')
	async getAskedFriendList(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('askFriend')
	async askFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const friend = await this.userRepository.findOne({where: {username_42: data.username_42}});

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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('unAskFriend')
	async unAskFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const friend = await this.userRepository.findOne({where: {username_42: data.username_42}});
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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('acceptFriend')
	async acceptFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const friend = await this.userRepository.findOne({where: {username_42: data.username_42}});
			// console.log("test?", user, friend, data);
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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('refuseFriend')
	async refuseFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const friend = await this.userRepository.findOne({where: {username_42: data.username_42}});
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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('removeFriend')
	async removeFriend(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const friend = await this.userRepository.findOne({where: {username_42: data.username_42}});
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
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('unblockUser')
	async unblockUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try{
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const dude = await this.userRepository.findOne({where: {username_42: data.username_42}});
			if (!user || !dude)
			{
				this.server.to(client.id).emit('error_unblockUser', {error: "User not found"});
				return;
			}
			try {
				const success = await this.friendSystemService.unblockUser(user.username, dude.username);
				this.server.to(client.id).emit('success_unblockUser', {success: true});
			} catch (error) {
				this.server.to(client.id).emit('error_unblockUser', {error: error.message});
			}
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('blockUser')
	async blockUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const dude = await this.userRepository.findOne({where: {username_42: data.username_42}});
			if (!user || !dude)
			{
				this.server.to(client.id).emit('error_blockUser', {error: "User not found"});
				return;
			}
			try {
				const success = await this.friendSystemService.blockUser(user.username, dude.username);
				this.server.to(client.id).emit('success_blockUser', {success: true});
			} catch (error) {
				this.server.to(client.id).emit('error_blockUser', {error: error.message});
			}
		}catch(e){}
	}

	@UseGuards(WsThrottlerGuard)
	@SubscribeMessage('isUserBlocked')
	async isUserBlocked(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
		try {
			const user = await this.userRepository.findOne({where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42}});
			const dude = await this.userRepository.findOne({where: {username_42: data.username_42}});
			if (!user || !dude)
			{
				this.server.to(client.id).emit('error_isUserBlocked', {error: "User not found"});
				return;
			}
			try {
				const success = await this.friendSystemService.isUserBlocked(user.username, dude.username);
				this.server.to(client.id).emit('success_isUserBlocked', {success: true, isUserBlocked: success});
			} catch (error) {
				this.server.to(client.id).emit('error_isUserBlocked', {error: error.message});
			}
		}catch(e){}
	}
}
