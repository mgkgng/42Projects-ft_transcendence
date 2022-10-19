import {Block} from "./app.Block"
import { MapHeight, MapWidth, PaddleSize } from "./app.utils";

export class GameMap {
	blocks : Array<Block>;
	width: number;
	height: number;
	paddleSize: number; // TODO put it into class Pong

	constructor(mapWidth: number = MapWidth.Medium,
		mapHeight: number = MapHeight.Medium,
		paddleSize: number = PaddleSize.Large,
		blocks: Array<Block> = []) {
		this.width = mapWidth;
		this.height = mapHeight;
		this.paddleSize = paddleSize;
		this.blocks = blocks;
	}
}