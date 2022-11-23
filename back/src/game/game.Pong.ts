import { Paddle } from "./game.Paddle";
import { Puck } from "./game.Puck"

export class Pong {
	mapSize: Array<number>;
	puckSpeed: number;
	puck: Puck;
	paddles: Array<Paddle>;

	constructor(mapSize: Array<number>, puckSpeed: number, paddleWidth: number) {
		this.mapSize = mapSize;
		this.puckSpeed = puckSpeed;
		this.puck = new Puck(this.mapSize, this.puckSpeed);
		this.paddles = [new Paddle(mapSize, paddleWidth, 0), new Paddle(mapSize, paddleWidth, 1)];
	}

	movePaddle(index: number, left: boolean) { this.paddles[index].move(left); }
}