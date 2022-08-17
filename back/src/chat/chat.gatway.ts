import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  } from '@nestjs/websockets';
import { Socket } from 'dgram';

@WebSocketGateway({
	cors: {
	  origin: '*',
	},
})
export class ChatService {
	@WebSocketServer() server;

	after_init(){
		console.log('init');
		return ({"create" : "bite"});
	}

	handleConnection()
	{
		console.log('Connect');
		return ("connect");
	}

	handleDisconnect()
	{
		console.log('Disconnect');
	}

	@SubscribeMessage('pute')
	handleEvent(@MessageBody('data') data: string, @ConnectedSocket() client: Socket): string {
		this.server.emit('salut', "on baise?");
		client.emit("salut", {"on baise ?" : 1});
		return (data);
	}
	
}

