export class Message {
	roomID: string = "";
	username : string = "";
	message : string = "";
	date : Date = new Date();

	constructor(roomID: string, username: string, message: string, date: Date) {
		this.roomID = roomID;
		this.username = username;
		this.message = message;
		this.date = date;
	}
}