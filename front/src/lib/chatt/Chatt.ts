import { browser } from "$app/environment";
import { ChattRoom } from "$lib/chatt/ChattRoom";

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

	sortRoomsValues(values: any[]) {
		values.sort((a: any, b: any) => {
			if (!a.messages.length && b.messages.length)
				return (-1);
			else if (a.messages.length && !b.messages.length)
				return (1);
			else if (!a.messages.length && !b.messages.length)
				return (0);

			if (a.messages[a.messages.length - 1].date > b.messages[b.messages.length - 1].date)
				return (-1);
			else if (a.messages[a.messages.length - 1].date < b.messages[b.messages.length - 1].date)
				return (1);

			return (0);
		});
		return (values);
	}
	  
}