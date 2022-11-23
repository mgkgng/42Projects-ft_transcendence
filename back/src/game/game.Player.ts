import { Paddle } from "./game.Paddle";

export class Player {
	username: string;
	info: any;
	isHost: boolean;
	paddle: Paddle;
	score: number;
	index: number;
	control: Array<any>;

	constructor(userInfo: any, isHost: boolean, index: number) {
		this.username = userInfo.username_42;
		this.info = userInfo;
		this.isHost = isHost;
		this.score = 0;
		this.index = 0;
		this.control = [undefined, undefined];
	}
}