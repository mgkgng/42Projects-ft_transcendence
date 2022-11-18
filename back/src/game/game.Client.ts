import { Socket } from "socket.io";

export class Client {
	id: string;
	username: string;
	socket: Socket;
	room: string; // room to which the client actually belongs
	user: any;

	constructor(socket: Socket, username: string, user: any) {
		this.id = socket.id;
		this.username = username;
		this.socket = socket;
		this.room = "";
		this.user = user;
	}
}