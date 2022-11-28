export class Message {
	room: string = "";
	username : string = "";
	message : string = "";
	date : Date = new Date();

	constructor(room: string, username: string, message: string, date: Date) {
		this.room = room;
		this.username = username;
		this.message = message;
		this.date = date;
	}
}