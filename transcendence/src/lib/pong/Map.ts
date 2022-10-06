interface Wall {
	startX : number;
	startY: number;
	endX : number;
	endY : number;
}

export const PaddleSize = {
	"S" : 15,
	"M" : 30,
	"L" : 45
}

export class Map {
	walls : Array<Wall>;
	width: number;
	height: number;
	constructor(mapWidth: number, mapHeight: number, paddleSize: number = "L", walls: Array<Wall> = []) {
		this.width = mapWidth;
		this.height = mapHeight;
		this.walls = [{startX: 0, startY: 0, endX: mapWidth, endY: 0},
			{startX: 0, startY: 0, endX: 0, endY: mapHeight},
			{startX: mapWidth, startY: 0, endX: mapWidth, endY: mapHeight},
			{startX: 0, startY: mapHeight, endX: mapWidth, endY: mapHeight}
		]
		this.walls.concat(walls);
	}
}