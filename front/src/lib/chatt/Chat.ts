import { browser } from "$app/environment";
import { ChatRoom } from "$lib/chatt/chatRoom";

export class Chat {
	rooms: Map<string, ChatRoom>;	//toutes les rooms (utilisées pour s'ajouter a une room) // TODO a modifier
	my_rooms: Array<string>;				//room visibles pour l'utilisateur
	username_search : string;			//username search profile

	constructor(rooms: any) {
		// this.all_rooms = rooms;
		this.rooms = new Map<string, ChatRoom>();
		this.my_rooms = [];
		this.username_search = "";
	}
	
	loadMessages(client : any) {
		// socket_event_update_front(client);			
	}

	sortRoomsKeys(keys : string[]) {
		keys.sort((a: string, b: string) => 
		{
			let res : number = 0;
			console.log(a, b);
			console.log(this.rooms);
			if (!this.rooms.get(a).messages.length && this.rooms.get(b).messages.length)
				return (-1);
			else if (this.rooms.get(a).messages.length && !this.rooms.get(b).messages.length)
				return (1);
			else if (!this.rooms.get(a).messages.length && !this.rooms.get(b).messages.length)
				return (0);
			if (this.rooms.get(a).messages[this.rooms.get(a).messages.length - 1].date > this.rooms.get(b).messages[this.rooms.get(b).messages.length - 1].date)
				res = -1;
			else if (this.rooms.get(a).messages[this.rooms.get(a).messages.length - 1].date < this.rooms.get(b).messages[this.rooms.get(b).messages.length - 1].date)
				res = 1;
			return (res);
		});
		return(keys);
	}
}