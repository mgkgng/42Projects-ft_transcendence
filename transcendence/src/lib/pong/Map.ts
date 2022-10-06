interface Wall {
	startX : number;
	startY: number;
	endX : number;
	endY : number;
}

export const PaddleSize = {
	XSmall: 20,
	Small : 40,
	Medium : 80,
	Large : 130
}

export class Map {

	walls : Array<Wall>;
	width: number;
	height: number;
	paddleSize: number;

	constructor(mapWidth: number, mapHeight: number, paddleSize: number = PaddleSize.Medium, walls: Array<Wall> = []) {
		this.width = mapWidth;
		this.height = mapHeight;
		this.paddleSize = paddleSize;
		this.walls = [{startX: 0, startY: 0, endX: mapWidth, endY: 0},
			{startX: 0, startY: 0, endX: 0, endY: mapHeight},
			{startX: mapWidth, startY: 0, endX: mapWidth, endY: mapHeight},
			{startX: 0, startY: mapHeight, endX: mapWidth, endY: mapHeight}
		]
		this.walls.concat(walls);
	}
}