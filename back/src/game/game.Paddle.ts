export class Paddle {
	width: number;
	pos: number;
	moveLimit: Array<number>;
	index: number;

	constructor(mapSize: Array<number>, width: number, index: number) {
		this.width = width;
		this.pos = (mapSize[0] - width) / 2;
		this.moveLimit = [0, mapSize[0] - width];
		this.index = index;
	}

	move(left: boolean) {
		//TODO put the accelerating speed on paddle

		if ((this.pos == this.moveLimit[0] && left)
			|| (this.pos == this.moveLimit[1] && !left))
			return ;

		this.pos += (left) ? -8 : 8;

		if (this.pos < this.moveLimit[0])
			this.pos = this.moveLimit[0];
		else if (this.pos > this.moveLimit[1])
			this.pos = this.moveLimit[1];
	}
}