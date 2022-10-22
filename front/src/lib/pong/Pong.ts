//* brainstorming here */
// 1. mode de jeu : basic mode, advanced mode
// 2. map : complication of maps (walls for example)
// 3. items

// paddle / puck

/* puck { vectorVelocity, } */

import { Puck } from "./Puck";
import { GameMap } from "./GameMap";

export class Pong {
	gameMap: GameMap;
	puck: Puck;
	paddlePos: Array<number>;

	constructor() {
		this.gameMap = new GameMap();
		this.puck = new Puck(this.gameMap.width, this.gameMap.height);

		let initPos = (this.gameMap.width - this.gameMap.paddleSize) / 2;
		this.paddlePos = [initPos, initPos];
	}
}