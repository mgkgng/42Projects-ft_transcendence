import { Inject } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { MainServerService } from "src/mainServer/mainServer.gateway";
import { ChatDirectMessageService } from "./chatDirectMessage.service";

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
        private chatDirectMessageService : ChatDirectMessageService
    ) {}

    // Subscribe to the event 'receiveMessage' from the client
    // and call the method 'receiveMessage' of the service
    @SubscribeMessage('newDirectMessage')
    async receiveMessage(@MessageBody() data: any, @ConnectedSocket() client: any) {
        const userConnected = this.mainServerService.getUserConnectedByUsername(data.username);
        if (userConnected)
            userConnected.socket.emit('newDirectMessage', data.message);
        // return this.chatDirectMessageService.handleSendDirectMessage(data.username_sender, data.username_receiver, data.message);
    }
}