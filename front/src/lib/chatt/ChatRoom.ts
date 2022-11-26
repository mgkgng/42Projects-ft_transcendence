import { Message } from "$lib/chatt/Message";
import { UserRoom } from "$lib/chatt/UserRoom";

export class ChatRoom {
	room_name : string = "";
	is_password_protected : boolean = false;
	is_private : boolean = false;
	is_admin : boolean = false;
	is_owner : boolean = false;
	messages : Array<Message>;
	usersRoom : any[];
	constructor(room_name : string, is_password_protected : boolean, is_private : boolean, are_you_admin : boolean, are_you_owner : boolean)
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


//Ici les evenements qui changent les attributs de chatRoom et qui sont suscribe dans le front
// (obligation d'utiliser update() pour un rafraichissement du front)
function socket_event_update_front(client : any) {
	client.socket.on("get_all_rooms", (data : any) => {
		chatRoom.update((chatRoom: any) => {
			chatRoom.all_rooms = new Map();
			for (let r of data)
				chatRoom.all_rooms.set(r.name, r.is_password_protected);
			return (chatRoom);
		});
	});
	client.socket.on("get_my_rooms", (data : any) => { //HAVE TO OPTIMIZE : NOT REALOAD ALL MESSAGE WHEN A ROOM IS ADDED OR DELETED
		chatRoom.update((chatRoom: any) => {
			chatRoom.rooms = [];
			chatRoom.messages = new Map();
			chatRoom.actualRoom = new ChatRoom("", false, false, false, false);
			return(chatRoom);
		});
		chatRoom.update((chatRoom: any) => {
			for (let rooms of data ){
				chatRoom.rooms.push(rooms.room.name);
				chatRoom.messages.set(rooms.room.name, new ChatRoom(rooms.room.name, rooms.room.is_password_protected, rooms.room.is_private, rooms.is_admin, rooms.is_owner))
				client.socket.emit("get_message_room", {room_name: rooms.room.name});
				client.socket.emit("get_users_room", {room_name: rooms.room.name});
			}
			// console.log(data);
			// console.log("rooms: ", chatRoom.rooms);
			return (chatRoom);
		});
	});
	client.socket.on("get_message_room", (data: any) => {
		chatRoom.update((chatRoom: any) => {
			let inter : Array<Message> = [];
			for (let message of data.messages)
				inter.push(new Message(message.id_chat_room.name, message.id_user.username, message.content_message, message.date_message));
			chatRoom.messages.get(data.room_name).messages = inter;
			console.log("Message2: ", chatRoom);
			return (chatRoom);
		});
	});
	client.socket.on("get_users_room", (data: any) =>
	{
		chatRoom.update((chatRoom: any) => {
			let inter : Array<UserRoom> = new Array<UserRoom>;
			for (let users of data.users)
				inter.push(new UserRoom(users.id_user.username, users.is_admin, users.is_owner, users.is_login))
			chatRoom.messages.get(data.room_name).usersRoom = inter;
			return (chatRoom);
		});
	})
	client.socket.on("new_message_room", (data : any) =>
	{
		chatRoom.update( chat => {
			console.log("newMessage: ", data, chat);
			chat.messages.get(data.room_name).messages.push(new Message(data.room_name, data.username, data.content_message, data.date_message));
			return (chat);
		});
	});
	client.socket.on("new_room", (data : any) =>
	{
		chatRoom.update( chat => {
			chat.rooms.push(data.room_name);
			const mess : Message[] = [];
			chat.messages.set(data.room_name, new Room(data.room_name, data.is_password_protected, data.is_private, data.is_admin, true));
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
