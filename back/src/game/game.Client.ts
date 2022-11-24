import { Socket } from "socket.io";
import { UserState } from "./game.utils";
import { GameGateway } from "./game.gateway";

export class Client {
	id: string;
	username: string;
	sockets: Map<string, Socket>;
	state: number;
	room: string;

	constructor(username: string, socket: Socket) {
		this.username = username;
		this.sockets = new Map<string, Socket>();
		this.sockets.set(socket.id, socket);
		this.isAvailable();
	}

	isAvailable() {
		this.state = UserState.Available;
		this.room = "";
	}

	isPlaying(roomID: string) {
		this.state = UserState.Playing;
		this.room = roomID;
	}

	isWatching(roomID: string) {
		this.state = UserState.Watching;
		this.room = roomID;
	}

	broadcast(event: string, data: any) { GameGateway.broadcast(this.sockets.values(), event, data); }
}