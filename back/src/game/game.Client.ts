import { Socket } from "socket.io";
import { UserState } from "./game.utils";
import { GameGateway } from "./game.gateway";

export class Client {
	id: string;
	username_42: string;
	sockets: Map<string, Socket>;
	state: number;
	room: string;
	newMessages: Map<string, boolean>;
	newRequests: Map<string, boolean>;

	constructor(username_42: string, socket: Socket) {
		this.id = socket.id;
		this.username_42 = username_42;
		this.sockets = new Map<string, Socket>();
		this.sockets.set(socket.id, socket);
		this.isAvailable();
		this.newMessages = new Map<string, boolean>;
		this.newRequests = new Map<string, boolean>;
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

	newMessageReceived(from: string) {
		this.newMessages.set(from, true);
		this.broadcast('newMessageArrived', from);
	}

	updateRequest(from: string, askFriend: boolean) {
		if (askFriend) {
			this.newRequests.set(from, true);
			this.broadcast('askFriendGNotification', { friend: from });
		} else {
			this.newRequests.delete(from);
			this.broadcast('unAskFriendGNotification', { friend: from });
		}
	}

	broadcast(event: string, data: any) { GameGateway.broadcast(this.sockets.values(), event, data); }
}