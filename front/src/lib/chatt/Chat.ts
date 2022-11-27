import { browser } from "$app/environment";
import { ChatRoom } from "$lib/chatt/chatRoom";

export class Chat {
	all_rooms: Map<string, ChatRoom>;	//toutes les rooms (utilisées pour s'ajouter a une room) // TODO a modifier
	my_roomlist: Array<string>;				//room visibles pour l'utilisateur
	my_rooms : Map<string, ChatRoom>;	//les messages de chaques room
	username_search : string;			//username search profile

	constructor(rooms: any) {
		// this.all_rooms = rooms;
		this.all_rooms = new Map<string, ChatRoom>();
		this.my_roomlist = [];
		this.my_rooms = new Map<string, ChatRoom>();
		this.username_search = "";
	}
	
	loadMessages(client : any) {
		// socket_event_update_front(client);			
	}

	deleteRoom(room : any) {
		this.my_rooms.delete(room);
	}

	sortRoomsKeys(keys : string[]) {
		keys.sort((a: string, b: string) => 
		{
			let res : number = 0;
			console.log(a, b);
			console.log(this.messages);
			if (!this.messages.get(a).messages.length && this.messages.get(b).messages.length)
				return (-1);
			else if (this.messages.get(a).messages.length && !this.messages.get(b).messages.length)
				return (1);
			else if (!this.messages.get(a).messages.length && !this.messages.get(b).messages.length)
				return (0);
			if (this.messages.get(a).messages[this.messages.get(a).messages.length - 1].date > this.messages.get(b).messages[this.messages.get(b).messages.length - 1].date)
				res = -1;
			else if (this.messages.get(a).messages[this.messages.get(a).messages.length - 1].date < this.messages.get(b).messages[this.messages.get(b).messages.length - 1].date)
				res = 1;
			return (res);
		});
		return(keys);
	}
}