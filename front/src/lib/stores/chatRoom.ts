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

class rooms
{
	room_name : string = "";
	is_password_protected : boolean = false;
	is_private : boolean = false;
	are_you_admin : boolean = false;
	constructor(room_name : string, is_password_protected : boolean, is_private : boolean, are_you_admin : boolean)
	{
		this.room_name = room_name;
		this.is_password_protected = is_password_protected;
		this.is_private = is_private;
		this.are_you_admin = are_you_admin;
	}
}
let client : any;

export class ChatRooms{
	all_rooms: Map<string, boolean> = new Map(); //toutes les rooms (utilisées pour s'ajouter a une room)
	rooms: Array<string> = [];					//room visibles pour l'utilisateur
	messages : Map<string, Array<Message>> = new Map();		//les messages de chaques room
	actualRoom : Array<Message> = [];			//messages de la room de actualRoomName
	actualRoomName : string = "";				//room selectionnee 

	constructor() {
	}
	LoadMessages(client : any)
	{
		if (browser)
		{
			console.log("Try load messages");
			client.socket.emit("get_my_rooms", {});
			
			
			client.socket.on("set_room_not_visible", (data) => {
				client.socket.emit("get_my_rooms", {});
			});
			client.socket.on("set_room_visible", (data) => {
				client.socket.emit("get_my_rooms", {});
			});
			socket_event_update_front(client);			
		}
	}
	deleteRoom(room : any)
	{
		this.messages.delete(room);
	}
}
//Ici les evenements qui changent les attributs de chatRoom et qui sont suscribe dans le front
// (obligation d'utiliser update() pour un rafraichissement du front)
function socket_event_update_front(client : any) {
	client.socket.on("get_all_rooms", (data : any) => {
		chatRoom.update((chatRoom) => {
			chatRoom.all_rooms = new Map();
			for (let r of data)
				chatRoom.all_rooms.set(r.name, r.is_password_protected);
			return (chatRoom);
		});
	});
	client.socket.on("get_my_rooms", (data : any) => { //HAVE TO OPTIMIZE : NOT REALOAD ALL MESSAGE WHEN A ROOM IS ADDED OR DELETED
		chatRoom.update((chatRoom) => {
			chatRoom.rooms = [];
			chatRoom.messages = new Map();
			chatRoom.actualRoom = [];
			return(chatRoom);
		});
		chatRoom.update((chatRoom) => {
			for (let rooms of data ){
				chatRoom.rooms.push(rooms);
				client.socket.emit("get_message_room", {room_name: rooms});
			}
			console.log(data);
			console.log("rooms: ", chatRoom.rooms);
			return (chatRoom);
		});
	});
	client.socket.on("get_message_room", (data: any) => {
		chatRoom.update((chatRoom) => {
			let inter : Array<Message> = [];
			for (let message of data.messages)
				inter.push(new Message(message.id_chat_room.name, message.id_user.username, message.content_message));
			chatRoom.messages.set(data.room_name, inter);
			console.log("Message2: ", chatRoom);
			return (chatRoom);
		});
	});
	client.socket.on("new_message_room", (data : any) =>
	{
		chatRoom.update( chat => {
			console.log("newMessage: ", data, chat);
			chat.messages.get(data.room_name).push(new Message(data.room_name, data.username, data.content_message));
			return (chat);
		});
	});
	client.socket.on("new_room", (data : any) =>
	{
		chatRoom.update( chat => {
			chat.rooms.push(data.room_name);
			chat.message.set(data.room_name , []);
			return (chat);
		});
	});
	client.socket.on("error_append_user_to_room", (data : any) =>{
		alert(data.error);
	});
}
export const chatRoom = writable(new ChatRooms());