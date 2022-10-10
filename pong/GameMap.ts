import { Block } from "./Block";

export const PaddleSize = {
	XSmall: 20,
	Small : 40,
	Medium : 80,
	Large : 130
}

export const MapWidth = {
	Small: 400,
	Medium: 700,
	Large: 1000
}

export const MapHeight = {
	Small: 600,
	Medium: 800,
	Large: 1000
}

export class GameMap {

	blocks : Array<Block>;
	width: number;
	height: number;
	paddleSize: number;

	constructor(mapWidth: number = MapWidth.Medium,
		mapHeight: number = MapHeight.Medium,
		paddleSize: number = PaddleSize.Medium,
		blocks: Array<Block> = []) {
		this.width = mapWidth;
		this.height = mapHeight;
		this.paddleSize = paddleSize;
		this.blocks = blocks;
	}
}