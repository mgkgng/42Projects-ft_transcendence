import { Puck } from "./game.Puck";
import { GameMap } from "./game.GameMap";

export class Pong {
	gameMap: GameMap;
	puck: Puck;
	paddleSize: number;
	paddlePos: Array<number>;
	moveMin: number;
	moveMax: number;
	scores: Array<number>;

	constructor(difficulty: number) {
		this.gameMap = new GameMap();
		this.puck = new Puck(this.gameMap.width,
			this.gameMap.height,
			difficulty * ((Math.floor(Math.random() * 2)) ? 1 : -1));

		let initPos = (this.gameMap.width - this.gameMap.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];

		this.moveMin = 0;
		this.moveMax = this.gameMap.width - this.gameMap.paddleSize;
	
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