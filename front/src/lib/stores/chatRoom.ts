import { writable } from "svelte/store";
import { browser } from "$app/environment";

class Message 
{
	room: string = "";
	username : string = "";
	message : string = "";

	constructor(room : string, username : string, message : string)
	{
		this.room = room;
		this.username = username;
		this.message = message;
	}
}

class ChatRooms{
	rooms: Array<string> = [];
	messages : Array<Array<Message>> = [];
	actualRoom : Array<Message> = [];
	actualRoomName : string = "";

	constructor() {
	}
	LoadMessages(client : any)
	{
		if (browser)
		{
			console.log("Try load messages");
			client.socket.emit("get_my_rooms", {});
			client.socket.on("get_my_rooms", (data : any) => {
				for (let rooms of data ){
					this.rooms.push(rooms);
					client.socket.emit("get_message_room", {room_name: rooms});
				}
				console.log(data);
				console.log(this.rooms);
			});
			client.socket.on("get_message_room", (data: any) => {
				let inter : Array<Message> = [];
				for (let message of data)
					inter.push(new Message(message.id_chat_room.name, message.id_user.username, message.content_message));
				this.messages.push(inter);
				console.log(data);
			});
			client.socket.on("new_message_room", (data : any) =>
			{
				this.messages[this.rooms.indexOf(data.room_name)].push(new Message(data.room_name, data.username, data.content_message));
				console.log("new_message: ", data);
			});
		}
	}
	selectRoom(room : any)
	{
		this.actualRoom = this.messages[this.rooms.indexOf(room.room)];
		console.log("actualRoom: ", this.actualRoom)
		console.log("nameRoom: ", room)
		return room.room;
	}
}

export const chatRoom = writable(new ChatRooms());