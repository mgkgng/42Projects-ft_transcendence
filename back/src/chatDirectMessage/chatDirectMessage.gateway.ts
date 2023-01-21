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

	// @SubscribeMessage('sendDirectMessage')
	// async sendMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
	// 	console.log("sendMessage")
	// 	const user = await this.userRepository.findOne({
	// 		where: {username: data.username}
	// 	});
	// 	const userSender = await this.userRepository.findOne({
	// 		where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}
	// 	});
	// 	if (!user || !userSender)
	// 	{
	// 		this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'User not found'});
	// 		return;
	// 	}
	// 	if (await this.friendSystemService.isUserBlocked(userSender.username, user.username))
	// 	{
	// 		this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'User blocked'});
	// 		return;
	// 	}
	// 	// NOTIFICATION PART
	// 	const userConnected = this.mainServerService.getUserConnectedByUsername(data.username);
	// 	if (!(await this.friendSystemService.isUserBlocked(user.username, userSender.username))) {
	// 		this.mainServerService.addNotification(user.username, "directMessage", {});
	// 		if (userConnected)
	// 		{
	// 			this.server.to(this.mainServerService.getUserConnectedListBySocketId(this.mainServerService.getUserConnectedByUsername(userConnected.username).id))
	// 			.emit("notification", {type: "directMessage", username: userSender.username, data: {}});
	// 		}
	// 		else
	// 		{
	// 			this.mainServerService.addNotification(user.username, "directMessage", {});
	// 		}
	// 	}
	// 	let ret = await this.chatDirectMessageService.handleSendDirectMessage(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username, data.message);
	// 	if (ret)
	// 		this.server.to(client.id).emit('success_sendDirectMessageG', {message: data.message});
	// 	else
	// 		this.server.to(client.id).emit('error_sendDirectMessageG', {error: 'An error occured'});
	// 	if (userConnected && !(await this.friendSystemService.isUserBlocked(user.username, userSender.username)))
	// 	{
	// 		let emitList = this.mainServerService.getUserConnectedListBySocketId(this.mainServerService.getUserConnectedByUsername(data.username).id);
	// 		// For whatever reason if i use success_getDirectMessage it doesnt work, apparently is a bug about namespaces
	// 		this.server.to(client.id).emit('getDirectMessage', { id: ret.id_g, sender: ret.message_sender.username, recipient: ret.message_recipient.username, message: ret.string, date: ret.date});
	// 		emitList.forEach(element => {
	// 			this.server.to(element.id).emit('getDirectMessage', { id: ret.id_g, sender: ret.message_sender.username, recipient: ret.message_recipient.username, message: ret.string, date: ret.date});
	// 		});
	// 	}
	// }

	// Get all the chatDirectMessage between 2 users
	@SubscribeMessage('getDirectMessage')
	async getDirectMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
		const user = await this.userRepository.findOne({
			where: {username_42: data.username_42},
			select: ["username", "username_42"]
		});

		const userSender = await this.userRepository.findOne({
			where: {username_42: this.mainServerService.getUserConnectedBySocketId(client.id).username_42},
			select: ["username", "username_42"]
		});
		if (!user || !userSender)
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'User not found'});
			return;
		}
		if (await this.friendSystemService.isUserBlocked(userSender.username, user.username))
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'User blocked'});
			return;
		}
		if (await this.friendSystemService.isUserBlocked(user.username, userSender.username))
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'You\'ve been blocked by this user'});
			return;
		}

		// const messages = await this.chatDirectMessageService.handleGetDirectMessageHistory(userSender.username, user.username, data.limit, data.offset);
		if (Number(data.page) < 0 || Number(data.pageSize) < 0 || Number(data.page) == NaN || Number(data.pageSize) == NaN)
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'Invalid page or pageSize'});
			return;
		}
		const messages = await this.chatDirectMessageService.handleGetDirectMessageHistory(userSender.username, user.username, data.page, data.pageSize);
		if (messages) {
			this.server.to(client.id).emit('success_getDirectMessage', { messageHistory: messages });
		} else {
			this.server.to(client.id).emit('error_getDirectMessage', { error: 'An error occured' });
		}
	}

	@SubscribeMessage('getMessageUserList')
	async getMessageUserList(@MessageBody() data: any, @ConnectedSocket() client: any) {
		let ret = await this.chatDirectMessageService.handleGetMessageUserList(this.mainServerService.getUserConnectedBySocketId(client.id).username_42);
		if (ret)
			this.server.to(client.id).emit('success_getMessageUserList', {messageUserList: ret});
		else
			this.server.to(client.id).emit('error_getMessageUserList', {error: 'An error occured'});
	}
}