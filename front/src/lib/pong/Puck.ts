import { PongConfig } from "$lib/stores/var";

export class Puck {
	pos: Array<number>;
	vec: Array<number>;
	mapSize: Array<number>;

	constructor(vec: Array<number>, pos: Array<number>, mapSize: Array<number>) {
		this.vec = vec;
		this.pos = pos;
		this.mapSize = mapSize;
	}

	move() {
		// If the puck has hit the wall, change the direction on X vector
		if (this.pos[0] < 0 || this.pos[0] > this.mapSize[0] - PongConfig.PuckSize) //puck size counted
			this.vec[0] *= -1;

		// Move
		this.pos[0] += this.vec[0];
		this.pos[1] += this.vec[1];
	}
}