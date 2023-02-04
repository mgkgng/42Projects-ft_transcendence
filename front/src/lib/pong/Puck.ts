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

	move() {
		let newPos = [this.pos[0][0] + this.vec[0], this.pos[0][1] + this.vec[1]];
		if (newPos[1] < PongConfig.DeadZoneHeight + PongConfig.PaddleHeight) {
			let diff = PongConfig.DeadZoneHeight + PongConfig.PaddleHeight - newPos[1];
			newPos[1] = PongConfig.DeadZoneHeight + PongConfig.PaddleHeight + diff;
			this.already = true;
			this.vec[1] *= -1;
		}
		else if (newPos[1] > this.mapSize[1] - PongConfig.DeadZoneHeight - PongConfig.PaddleHeight) {
			let diff = newPos[1] - this.mapSize[1] + PongConfig.DeadZoneHeight + PongConfig.PaddleHeight;
			newPos[1] = this.mapSize[1] - PongConfig.DeadZoneHeight - PongConfig.PaddleHeight - diff;
			this.already = true;
			this.vec[1] *= -1;
		}
		// If the puck has hit the wall, change the direction on X vector

		this.pos.unshift(newPos);
		if (this.pos.length > 5)
			this.pos.splice(5, 1);

		if (this.pos[0][0] < 0) {
			this.pos[0][0] *= -1;
			this.vec[0] *= -1;
		} else if (this.pos[0][0] > this.mapSize[0]) {
			this.pos[0][0] = this.mapSize[0] - (this.pos[0][0] - this.mapSize[0]);
			this.vec[0] *= -1;
		}
	}
}