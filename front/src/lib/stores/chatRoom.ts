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

let client : any;

export class ChatRooms{
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
			socket_event_update_front(client);			
		}
	}
	selectRoom(room : any)
	{
		this.actualRoom = this.messages[this.rooms.indexOf(room.room)];
		this.actualRoomName = room.room;
		return room.room;
	}
}
//Ici les evenements qui changent les attributs de chatRoom qui sont suscribe dans le front
// (obligation d'utiliser update() )
function socket_event_update_front(client : any) {
	client.socket.on("new_message_room", (data : any) =>
	{
		chatRoom.update( chat => {
			chat.messages[chat.rooms.indexOf(data.room_name)].push(new Message(data.room_name, data.username, data.content_message));
			return (chat);
		});
		chatRoom.update( chat => {
			chat.actualRoom = chat.messages[chat.rooms.indexOf(chat.actualRoomName)];
			return (chat);
		});
	});
	client.socket.on("new_room", (data : any) =>
	{
		chatRoom.update( chat => {
			chat.rooms.push(data.room_name);
			return (chat);
		});
	});
}
export const chatRoom = writable(new ChatRooms());