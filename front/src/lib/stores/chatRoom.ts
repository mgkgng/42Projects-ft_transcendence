import { writable } from "svelte/store";
import { browser } from "$app/environment";

class Message 
{
	room: string = "";
	username : string = "";
	message : string = "";
	date : Date = new Date();

	constructor(room : string, username : string, message : string, date : Date)
	{
		this.room = room;
		this.username = username;
		this.message = message;
		this.date = date;
	}
}
class userRoom{
	is_admin : boolean = false;
	is_owner: boolean = false;
	is_login: boolean = false;
	username : string = "";
	constructor(username : string, is_admin : boolean, is_owner : boolean, is_login : boolean)
	{
		this.is_admin = is_admin;
		this.username = username;
		this.is_owner = is_owner;
		this.is_login = is_login;
	}
};
export class Room
{
	id_public_room : string = "";
	room_name : string = "";
	is_password_protected : boolean = false;
	is_private : boolean = false;
	is_admin : boolean = false;
	is_owner : boolean = false;
	messages : Array<Message>;
	usersRoom : any[];
	constructor(id_public_room : string, room_name : string, is_password_protected : boolean, is_private : boolean, are_you_admin : boolean, are_you_owner : boolean)
	{
		this.room_name = room_name;
		this.is_password_protected = is_password_protected;
		this.is_private = is_private;
		this.is_admin = are_you_admin;
		this.is_owner = are_you_owner;
		this.messages = [];	
		this.usersRoom = [];
	}
}
let client : any;

export class ChatRooms{
	all_rooms: Map<string, Room> = new Map(); //toutes les rooms (utilisées pour s'ajouter a une room)
	rooms: Array<string> = [];					//room visibles pour l'utilisateur
	messages : Map<string, Room> = new Map();		//les messages de chaques room
	actualRoom  = new Room("", "", false, false, false, false);
	actualRoomName : string = "";				//room selectionnee 

	username_search : string = "";		//username search profile
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
			client.socket.on("notification_new_message_room", (data) => { //Get notofocation of a new message
				client.socket.emit("get_message_by_id", {id_message: data.id_message});
			});
			client.socket.on("get_message_by_id", (data) => {
				console.log("get_message_by_id", data);
			});
			client.socket.on("set_room_visible", (data) => {
				this.all_rooms.delete(data.id_public_room);
				client.socket.emit("get_my_rooms", {});
			});
			socket_event_update_front(client);			
		}
	}
	deleteRoom(room : any)
	{
		this.messages.delete(room);
	}
	sortRoomsKeys(keys : string[])
	{

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
//Ici les evenements qui changent les attributs de chatRoom et qui sont suscribe dans le front
// (obligation d'utiliser update() pour un rafraichissement du front)
function socket_event_update_front(client : any) {
	client.socket.on("get_all_rooms", (data : any) => {
		chatRoom.update((chatRoom) => {
			chatRoom.all_rooms = new Map();
			for (let r of data)
			{
				console.log(r);
				chatRoom.all_rooms.set(r.id_public_room, new Room(r.id_public_room, r.name, r.is_password_protected, false, false, false));
			}
			return (chatRoom);
		});
	});
	client.socket.on("get_my_rooms", (data : any) => { //HAVE TO OPTIMIZE : NOT REALOAD ALL MESSAGE WHEN A ROOM IS ADDED OR DELETED
		chatRoom.update((chatRoom) => {
			chatRoom.rooms = [];
			chatRoom.messages = new Map();
			chatRoom.actualRoom = new Room("", "", false, false, false, false);
			return(chatRoom);
		});
		chatRoom.update((chatRoom) => {
			for (let rooms of data ){
				chatRoom.rooms.push(rooms.room.name);
				chatRoom.messages.set(rooms.room.id_public_room, new Room(rooms.id_public_room, rooms.room.name, rooms.room.is_password_protected, rooms.room.is_private, rooms.is_admin, rooms.is_owner))
				client.socket.emit("get_message_room", {id_public_room: rooms.room.id_public_room});
				client.socket.emit("get_users_room", {id_public_room: rooms.room.id_public_room});
			}
			// console.log(data);
			return (chatRoom);
		});
	});
	client.socket.on("get_message_room", (data: any) => {
		chatRoom.update((chatRoom) => {
			console.log(chatRoom)
			let inter : Array<Message> = [];
			for (let message of data.messages)
				inter.push(new Message(message.id_chat_room.name, message.id_user.username, message.content_message, message.date_message));
			chatRoom.messages.get(data.id_public_room).messages = inter;
			console.log("Message2: ", chatRoom);
			return (chatRoom);
		});
	});
	client.socket.on("get_users_room", (data: any) =>
	{
		chatRoom.update((chatRoom) => {
			let inter : Array<userRoom> = new Array<userRoom>;
			for (let users of data.users)
				inter.push(new userRoom(users.id_user.username, users.is_admin, users.is_owner, users.is_login))
			chatRoom.messages.get(data.id_public_room).usersRoom = inter;
			return (chatRoom);
		});
	})
	client.socket.on("new_message_room", (data : any) =>
	{
		chatRoom.update( chat => {
			console.log("newMessage: ", data, chat);
			chat.messages.get(data.id_public_room).messages.push(new Message(data.room_name, data.username, data.content_message, data.date_message));
			return (chat);
		});
	});
	client.socket.on("new_room", (data : any) =>
	{
		chatRoom.update( chat => {
			chat.rooms.push(data.room_name);
			const mess : Message[] = [];
			chat.messages.set(data.id_public_room, new Room(data.id_public_room, data.room_name, data.is_password_protected, data.is_private, data.is_admin, true));
			return (chat);
		});
	});
	client.socket.on("error_new_message_room", (data : any) =>{
		alert(data.error);
	});
	client.socket.on("error_append_user_to_room", (data : any) =>{
		alert(data.error);
	});
}
export const chatRoom = writable(new ChatRooms());
