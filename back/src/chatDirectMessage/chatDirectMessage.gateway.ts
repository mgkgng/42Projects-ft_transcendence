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

    // Subscribe to the event 'receiveMessage' from the client
    // and call the method 'receiveMessage' of the service
    @SubscribeMessage('newDirectMessage')
    async receiveMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
        const user = await this.userRepository.findOne({where: {username: data.username}, relations: ['relation_userBlocked']});
        const userConnected = this.mainServerService.getUserConnectedByUsername(data.username);
        if (userConnected && user.relation_userBlocked.includes(client.username) == false)
            userConnected.socket.emit('newDirectMessage', data.message);
        // this.chatDirectMessageService.handleSendDirectMessage(this.mainServerService.getUserConnectedBySocketId(client.id).username, data.username, data.message);
    }
}