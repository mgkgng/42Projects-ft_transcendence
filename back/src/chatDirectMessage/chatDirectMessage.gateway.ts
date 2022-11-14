import { Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { MainServerService } from "src/mainServer/mainServer.gateway";
import { ChatDirectMessageService } from "./chatDirectMessage.service";
import { Repository } from "typeorm";
import { UserEntity } from "src/entity/User.entity";

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
}