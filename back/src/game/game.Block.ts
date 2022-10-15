
interface moveInfo {
	move: boolean,
	vectorX: number,
	vectorY: number,
	moveWidth: number,
	moveHeight: number
}

export class Block {
	startX : number;
	startY: number;
	endX : number;
	endY : number;
	gameWidth: number;
	gameHeight: number;
	moveInfo: moveInfo;

	constructor(startX: number, startY: number, endX: number, endY: number, 
		gameWidth: number, gameHeight: number, moveInfo: moveInfo) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.moveInfo = moveInfo;
	}

	move() {
		
	}
}

