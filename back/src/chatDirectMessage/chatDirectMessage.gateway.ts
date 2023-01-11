import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { MainServerService } from "src/mainServer/mainServer.service";
import { ChatDirectMessageService } from "./chatDirectMessage.service";
import { Repository } from "typeorm";
import { UserEntity } from "src/entity/User.entity";
import { WebSocketServer } from "@nestjs/websockets";
import { friendSystemService } from "src/friendSystem/friendSystem.service";

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class ChatDirectMessageGateway {
    constructor(
        @Inject(MainServerService)
        private mainServerService : MainServerService,
        @Inject(ChatDirectMessageService)
        private chatDirectMessageService : ChatDirectMessageService,
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
		@Inject(friendSystemService)
		private friendSystemService : friendSystemService,
    ) {}

	@WebSocketServer() server;

	@SubscribeMessage('sendDirectMessage')
	async sendMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
		console.log("sendMessage")
		const user = await this.userRepository.findOne({
			where: {username: data.username}
		});
		const userSender = await this.userRepository.findOne({
			where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}
		});
		if (!user || !userSender)
		{
			this.server.to(client.id).emit('error_sendDirectMessage', {error: 'User not found'});
			return;
		}
		if (this.friendSystemService.isUserBlocked(userSender.username, user.username))
		{
			this.server.to(client.id).emit('error_sendDirectMessage', {error: 'User blocked'});
			return;
		}
		const userConnected = this.mainServerService.getUserConnectedByUsername(data.username);
		console.log("send message" + await this.friendSystemService.isUserBlocked(user.username, userSender.username))
		if (userConnected && !(await this.friendSystemService.isUserBlocked(user.username, userSender.username)))
		{
			let emitList = this.mainServerService.getUserConnectedListBySocketId(client.id);
			emitList.forEach(element => {
				this.server.to(element.id).emit('getDirectMessage', {sender: userSender.username, message: data.message});
			});
		}
		let ret = await this.chatDirectMessageService.handleSendDirectMessage(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username, data.message);
		if (ret)
			this.server.to(client.id).emit('success_sendDirectMessage', {message: data.message});
		else
			this.server.to(client.id).emit('error_sendDirectMessage', {error: 'An error occured'});
	}

	// Get all the chatDirectMessage between 2 users
	@SubscribeMessage('getDirectMessage')
	async getDirectMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
		const user = await this.userRepository.findOne({
			where: {username: data.username}
		});
		const userSender = await this.userRepository.findOne({
			where:
			{username: this.mainServerService.getUserConnectedBySocketId(client.id).username}
		});
		if (!user || !userSender)
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'User not found'});
			return;
		}
		if (this.friendSystemService.isUserBlocked(userSender.username, user.username))
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'User blocked'});
			return;
		}
		let ret = await this.chatDirectMessageService.handleGetDirectMessageHistory(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username);
		if (ret)
			this.server.to(client.id).emit('success_getDirectMessage', {messageHistory: ret});
		else
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'An error occured'});
	}

	@SubscribeMessage('getMessageUserList')
	async getMessageUserList(@MessageBody() data: any, @ConnectedSocket() client: any) {
		let ret = await this.chatDirectMessageService.handleGetMessageUserList(this.mainServerService.getUserConnectedBySocketId(client.id).username);
		if (ret)
			this.server.to(client.id).emit('success_getMessageUserList', {messageUserList: ret});
		else
			this.server.to(client.id).emit('error_getMessageUserList', {error: 'An error occured'});
	}
}