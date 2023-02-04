import { PongConfig } from "$lib/stores/var";

export class Puck {
	pos: Array<Array<number>>;
	vec: Array<number>;
	mapSize: Array<number>;
	already: boolean;

	constructor(vec: Array<number>, pos: Array<number>, mapSize: Array<number>) {
		this.vec = vec;
		this.pos = [pos];
		this.mapSize = mapSize;
		this.already = false;
	}

	// move() {
	
	// }
}