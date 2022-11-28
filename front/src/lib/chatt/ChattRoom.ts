import { Message } from "$lib/chatt/Message";

export class ChattRoom {
	room_name : string = "";
	is_password_protected : boolean = false;
	is_private : boolean = false;
	is_admin : boolean = false;
	is_owner : boolean = false;
	messages : Array<Message>;
	users : any[];
	
	constructor(room_name : string, is_password_protected : boolean, is_private : boolean, is_admin : boolean, is_owner : boolean)
	{
		this.room_name = room_name;
		this.is_password_protected = is_password_protected;
		this.is_private = is_private;
		this.is_admin = is_admin;
		this.is_owner = is_owner;
		this.messages = [];	
		this.users = [];
	}
}