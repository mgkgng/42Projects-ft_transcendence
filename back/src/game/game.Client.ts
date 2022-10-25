import { Socket } from "socket.io";
import { uid } from "./game.utils";

export class Client {
	id: string;
	username: string;
	socket: Socket;
	room: string; // room to which the client actually belongs

	constructor(socket: Socket, username: string) {
		this.id = uid();
		this.username = username;
		this.socket = socket;
		this.room = "";
	}
}