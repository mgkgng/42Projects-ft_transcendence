import { browser } from "$app/environment";
import { ChatRoom } from "$lib/chatt/ChatRoom";

export class Chatt {
	rooms: Map<string, boolean>;
	my_rooms: Map<string, ChattRoom>;

	constructor() {
		this.rooms = new Map<string, boolean>();
		this.my_rooms = new Map<string, ChattRoom>();
	}

	sortRoomsKeys(keys : string[]) {
		keys.sort((a: string, b: string) => {
			let res : number   = 0;
			if (!this.my_rooms.get(a).messages.length && this.my_rooms.get(b).messages.length)
				return (-1);
			else if (this.my_rooms.get(a).messages.length && !this.my_rooms.get(b).messages.length)
				return (1);
			else if (!this.my_rooms.get(a).messages.length && !this.my_rooms.get(b).messages.length)
				return (0);
			if (this.my_rooms.get(a).messages[this.my_rooms.get(a).messages.length - 1].date > this.my_rooms.get(b).messages[this.my_rooms.get(b).messages.length - 1].date)
				res = -1;
			else if (this.my_rooms.get(a).messages[this.my_rooms.get(a).messages.length - 1].date < this.my_rooms.get(b).messages[this.my_rooms.get(b).messages.length - 1].date)
				res = 1;
			return (res);
		});
		return(keys);
	}
}