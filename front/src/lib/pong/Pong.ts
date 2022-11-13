import { Puck } from "./Puck";

export class Pong {
	size: Array<number>;
	paddleSize: number;
	puck: Puck;
	paddlePos: Array<number>;

	constructor(size: Array<number>) {
		this.size = size;
		this.puck = new Puck(this.size[0], this.size[1]);

		this.paddleSize = 80; //TODO automize it
		let initPos = (this.size[0] - this.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];
	}
}