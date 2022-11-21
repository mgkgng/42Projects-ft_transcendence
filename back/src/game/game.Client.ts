import { Socket } from "socket.io";
import { UserState } from "./game.utils";
import { GameGateway } from "./game.gateway";

export class Client {
	id: string;
	username: string;
	sockets: Map<string, Socket>;
	state: number; // room to which the client actually belongs

	constructor(username: string, socket: Socket) {
		this.username = username;
		this.sockets = new Map<string, Socket>();
		this.sockets.set(socket.id, socket);
		this.state = UserState.Available;
	}

	broadcast(event: string, data: any) {
		GameGateway.broadcast(this.sockets.values(), event, data);
	}

}