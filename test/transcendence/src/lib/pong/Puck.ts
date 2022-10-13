export class Puck {
	posX: number;
	posY: number;
	vectorX: number;
	vectorY: number;
	gameWidth: number;
	gameHeight: number;

	constructor(gameWidth : number, gameHeight : number, vectorX : number = 0, vectorY : number = 1) { // temporary test
		this.vectorX = vectorX;
		this.vectorY = vectorY;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.posX = gameWidth / 2;
		this.posY = gameHeight / 2;
	}

	// this is the callBack function 
	move() {
		this.posX += this.vectorX;
		this.posY += this.vectorY;

		//* here should check if it hits any wall */

		//* then here we should find the vector value */
	}

	getHit(vectorX: number, vectorY: number) {
		this.vectorX = vectorX;
		this.vectorY = vectorY;
	}
}