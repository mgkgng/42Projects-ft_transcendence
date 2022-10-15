import { Room } from "./game.Room";

export class Puck {
	posX: number;
	posY: number;
	vectorX: number;
	vectorY: number;
	gameWidth: number;
	gameHeight: number;

	constructor(gameWidth : number, gameHeight : number,
		vectorX : number = (Math.floor(Math.random() * 6) + 1) * ((Math.floor(Math.random() * 2)) ? 1 : -1), 
		vectorY: number = (Math.floor(Math.random() * 2)) ? 3 : -3) { // temporary test
		this.vectorX = vectorX;
		this.vectorY = vectorY;
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.posX = gameWidth / 2;
		this.posY = gameHeight / 2;
	}

	setCheckPuck(room: any) {
		// calculating the interval
		let frameDuration = 20;
		let deadZoneHeight = 50;
		let paddleHeight = 12;
		let ballSize = 30;

		let distToDeath = (this.vectorY > 0)
			? (this.gameHeight - deadZoneHeight - paddleHeight) - this.posY
			: this.posY - deadZoneHeight - paddleHeight; 
		// console.log("vector check: ", this.vectorX, this.vectorY);
		// console.log("puck pos check: ", this.posY);
		// console.log("distance check: ", distToDeath);

		let timeOut = Math.abs((distToDeath / this.vectorY)) * frameDuration;
		// console.log("checking the timeOut: ", timeOut);

		let deathPointX = this.calculPosX(distToDeath, frameDuration);
		console.log("checking deathPoint: ", deathPointX);

		room.broadcast(JSON.stringify({
			event: "DeathPointUpdate",
			data: deathPointX
		}));

		setTimeout(() => {
			
			// checking if the paddle hits the puck...
			let paddlePos = (this.vectorY > 0) ? room.pong.paddlePos[1] : this.gameWidth - room.pong.paddlePos[0];
			console.log((this.vectorY > 0) ? "This is Player2's turn." : "This is Player1's turn");
			console.log("checking paddlePos: ", paddlePos);
			if ((this.vectorY > 0 && deathPointX > paddlePos && deathPointX < paddlePos + room.pong.gameMap.paddleSize)
			|| (this.vectorY < 0 && deathPointX < paddlePos && deathPointX > paddlePos - room.pong.gameMap.paddleSize)) {
				console.log("PuckHit");
				room.broadcast(JSON.stringify({
					event: "PuckHit"
				}));
				this.posX = deathPointX;
				this.posY = (this.vectorY > 0) ? (this.gameHeight - deadZoneHeight - paddleHeight) : deadZoneHeight + paddleHeight;
				this.vectorY *= -1;
				this.setCheckPuck(room);
				return ;
			} else {
				console.log("ScoreUpdate");
				room.broadcast(JSON.stringify({
					event: "ScoreUpdate",
					data: (this.vectorY > 0) ? 0 : 1
				}));

				if (room.scores[0] == room.maxpoint || room.scores[1] == room.maxpoint) {
					room.broadcast(JSON.stringify({
						event: "GameFinished",
						data: (room.scores[0] > room.scores[1]) ? 0 : 1
					}));

					// TODO Save the game to the database

					return ;
				}

				room.pong.puck = new Puck(room.pong.gameMap.width, room.pong.gameMap.height);
				setTimeout(() => {
					Room.startPong(room);
				}, 1000);
			}
		}, timeOut);
	}

	calculPosX(distToDeath: number, frameDuration: number) {
		let frameOut = distToDeath / this.vectorY;
		// TODO precision should be made, it should be because of the css stuff
		if (frameOut < 0)
			frameOut = -frameOut + 1;
		let deathPointX = this.posX;
		let vecX = this.vectorX;

		console.log("frameout test: ", frameOut);

		for (let i = 0; i < frameOut; i++) {
			if (deathPointX < 0 || deathPointX > this.gameWidth - 30)
				vecX *= -1;
			deathPointX += vecX;
		}

		// return(deathPointX);

		return ((this.vectorY < 0) ? this.gameWidth - deathPointX : deathPointX);
	}
}