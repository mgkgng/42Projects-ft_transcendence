import {Puck} from "./app.Puck"
import {GameMap} from "./app.GameMap"

export class Pong {
	gameMap: GameMap;
	puck: Puck;
	paddlePos: Array<number>;
	moveMin: number;
	moveMax: number;

	constructor() {
		this.gameMap = new GameMap();
		this.puck = new Puck(this.gameMap.width, this.gameMap.height);

		let initPos = (this.gameMap.width - this.gameMap.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];

		this.moveMin = 0;
		this.moveMax = this.gameMap.width - this.gameMap.paddleSize;
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