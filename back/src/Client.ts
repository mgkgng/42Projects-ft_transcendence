import { Socket } from 'socket.io';

export class Client
{
	username : string;
	sock : Socket;
	constructor(socket_client : Socket, username : string)
	{
		this.username = username;
		this.sock = socket_client;
	}
};