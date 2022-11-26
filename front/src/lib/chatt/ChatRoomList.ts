import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { ChatRoom } from "$lib/chatt/chatRoom";

export class ChatRoomList {
	all_rooms: Map<string, boolean>; //toutes les rooms (utilisées pour s'ajouter a une room)
	rooms: Array<string>;					//room visibles pour l'utilisateur
	messages : Map<string, ChatRoom>;		//les messages de chaques room
	actualRoom : any;
	actualRoomName : string;				//room selectionnee 
	username_search : string;		//username search profile

	constructor() {
		this.all_rooms = new Map<string, boolean>();
		this.rooms = [];
		this.messages = new Map<string, ChatRoom>();
		this.actualRoomName = "";
		this.username_search = "";
	}
	
	loadMessages(client : any) {
		if (!browser)
			return ;

		console.log("Try load messages");
		client.socket.emit("get_my_rooms", {});
		
		client.socket.off("set_room_not_visible", (data) => {
		});
		client.socket.on("set_room_not_visible", (data) => {
			client.socket.emit("get_my_rooms", {});
		});
		client.socket.off("set_room_visible", (data) => {
		});
		client.socket.on("set_room_visible", (data) => {
			client.socket.emit("get_my_rooms", {});
		});


		// socket_event_update_front(client);			
	}

	deleteRoom(room : any) {
		this.messages.delete(room);
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

export const chatRoom = writable(new ChatRoomList());