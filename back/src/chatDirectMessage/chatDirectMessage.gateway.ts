import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { MainServerService } from "src/mainServer/mainServer.service";
import { ChatDirectMessageService } from "./chatDirectMessage.service";
import { Repository } from "typeorm";
import { UserEntity } from "src/entity/User.entity";
import { WebSocketServer } from "@nestjs/websockets";

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
        private userRepository : Repository<UserEntity>
    ) {}

	@WebSocketServer() server;

    @SubscribeMessage('newDirectMessage')
    async receiveMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
        const user = await this.userRepository.findOne({where: {username: data.username}, relations: ['relation_userBlocked']});
        const userSender = await this.userRepository.findOne({where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username}, relations: ['relation_userBlocked']});
        if (!user || !userSender || userSender.relation_userBlocked.includes(data.username))
            return;
        const userConnected = this.mainServerService.getUserConnectedByUsername(data.username);
        if (userConnected && user.relation_userBlocked.includes(client.username) == false)
            userConnected.socket.emit('newDirectMessage', data.message);
        let ret = await this.chatDirectMessageService.handleSendDirectMessage(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username, data.message);
    }

	@SubscribeMessage('sendDirectMessage')
	async sendMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
		const user = await this.userRepository.findOne({
			where: {username: data.username},
			relations: ['relation_userBlocked']
		});
		const userSender = await this.userRepository.findOne({
			where: {username: this.mainServerService.getUserConnectedBySocketId(client.id).username},
			relations: ['relation_userBlocked']
		});
		if (!user || !userSender || userSender.relation_userBlocked.includes(data.username))
		{
			this.server.to(client.id).emit('error_sendDirectMessage', {error: 'User not found or blocked'});
			return;
		}
		const userConnected = this.mainServerService.getUserConnectedByUsername(data.username);
		if (userConnected && user.relation_userBlocked.includes(client.username) == false)
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
			where: {username: data.username},
			relations: ['relation_userBlocked']
		});
		const userSender = await this.userRepository.findOne({
			where:
			{username: this.mainServerService.getUserConnectedBySocketId(client.id).username},
			relations: ['relation_userBlocked']
		});
		if (!user || !userSender)
		{
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'User not found'});
			return;
		}
		let ret = await this.chatDirectMessageService.handleGetDirectMessageHistory(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username);
		if (ret)
			this.server.to(client.id).emit('success_getDirectMessage', {messageHistory: ret});
		else
			this.server.to(client.id).emit('error_getDirectMessage', {error: 'An error occured'});
	}
}