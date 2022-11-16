import { Puck } from "./game.Puck"

export class Pong {
	size: Array<number>;
	puck: Puck;
	paddleSize: number;
	paddlePos: Array<number>;
	moveMin: number;
	moveMax: number;
	scores: Array<number>;

	constructor(size: Array<number>, puckSpeed: number, paddleSize: number) {
		
		this.size = size;
		this.puck = new Puck(this.size[0], this.size[1],
			puckSpeed);

		this.paddleSize = paddleSize // TODO put it into createGame
		let initPos = (this.size[0] - this.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];

		this.moveMin = 0;
		this.moveMax = this.size[0] - this.paddleSize;	
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