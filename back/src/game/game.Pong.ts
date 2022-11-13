import { Puck } from "./game.Puck"
import { PaddleSize } from "./game.utils";

export class Pong {
	size: Array<number>;
	puck: Puck;
	paddleSize: number;
	paddlePos: Array<number>;
	moveMin: number;
	moveMax: number;
	scores: Array<number>;

	constructor(size: Array<number>, difficulty: number) {
		this.size = size;
		this.puck = new Puck(this.size[0], this.size[1],
			difficulty * ((Math.floor(Math.random() * 2)) ? 1 : -1));

		let initPos = (this.size[0] - this.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];
		this.paddleSize = PaddleSize.Medium // TODO put it into createGame

		this.moveMin = 0;
		this.moveMax = this.size[0] - this.paddleSize;
	
		this.scores = [0, 0];
	}

	movePaddle(userIndex: number, left: boolean) {
		//TODO put the accelerating speed on paddle

		if ((this.paddlePos[userIndex] == this.moveMin && left)
			|| (this.paddlePos[userIndex] == this.moveMax && !left))
			return ;

		this.paddlePos[userIndex] += (left) ? -5 : 5;

		if (this.paddlePos[userIndex] <= this.moveMin)
			this.paddlePos[userIndex] == this.moveMin;
		else if (this.paddlePos[userIndex] >= this.moveMax)
			this.paddlePos[userIndex] == this.moveMax;
	}
}