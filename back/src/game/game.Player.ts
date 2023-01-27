import { Paddle } from "./game.Paddle";

export class Player {
	username_42: string;
	info: any;
	isHost: boolean;
	score: number;
	index: number;
	paddle: Paddle;
	control: any;

	constructor(userInfo: any, isHost: boolean, index: number, mapSize: Array<number>, paddleWidth: number) {
		this.username_42 = userInfo.username_42;
		this.info = userInfo;
		this.isHost = isHost;
		this.score = 0;
		this.index = index;
		this.paddle = new Paddle(mapSize, paddleWidth);
		this.control = undefined;
	}
}