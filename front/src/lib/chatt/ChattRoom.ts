import { Message } from "$lib/chatt/Message";
import { ChatRoomUser } from "$lib/chatt/ChatRoomUser";


export class ChattRoom {
	roomID: string = "";
	title : string = "";
	is_password_protected : boolean = false;
	is_private : boolean = false;
	is_admin : boolean = false;
	is_owner : boolean = false;
	messages : Array<Message>;
	actual_page : number = 0;
	old_page : number = 0;
	pages_messages : Array<Array<Message>> = [[]];
	is_new_message = false;
	users : Array<ChatRoomUser>;
	size_page : number = 100;
	
	constructor(roomID: string, title : string, is_password_protected : boolean, is_private : boolean, is_admin : boolean, is_owner : boolean) {
		this.roomID = roomID;
		this.title = title;
		this.is_password_protected = is_password_protected;
		this.is_private = is_private;
		this.is_admin = is_admin;
		this.is_owner = is_owner;
		this.messages = [];	
		this.users = [];
	}
}