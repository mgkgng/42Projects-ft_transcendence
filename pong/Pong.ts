//* brainstorming here */
// 1. mode de jeu : basic mode, advanced mode
// 2. map : complication of maps (walls for example)
// 3. items

// paddle / puck

/* puck { vectorVelocity, } */

import { Ball } from "./Ball";
import { GameMap } from "./GameMap";

export class Pong {
	gameMap: GameMap;
	ball: Ball;

	constructor() {
		this.gameMap = new GameMap();
		this.ball = new Ball(this.gameMap.width, this.gameMap.height);
	}
}