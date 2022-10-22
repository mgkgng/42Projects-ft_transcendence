import { Room } from "./game.Room";

export class Puck {
	posX: number;
	posY: number;
	vectorX: number;
	vectorY: number;
	gameWidth: number;
	gameHeight: number;

	constructor(gameWidth : number, gameHeight : number,
		vectorY: number) { // temporary test
		this.vectorX = (Math.floor(Math.random() * 6) + 1) * ((Math.floor(Math.random() * 2)) ? 1 : -1);
		this.vectorY = vectorY * ((Math.floor(Math.random() * 2)) ? 1 : -1);
		this.gameWidth = gameWidth;
		this.gameHeight = gameHeight;
		this.posX = gameWidth / 2;
		this.posY = gameHeight / 2;
	}

	setCheckPuck(room: any) {
		// calculating the interval
		let frameDuration = 20;
		let deadZoneHeight = 30;
		let paddleHeight = 12;
		let ballSize = 30;

		let distToDeath = (this.vectorY > 0)
			? (this.gameHeight - deadZoneHeight - paddleHeight) - this.posY
			: this.posY - deadZoneHeight - paddleHeight; // it functions well
		
		let frameNb = Math.floor(Math.abs((distToDeath / this.vectorY)));

		let timeOut = frameNb * frameDuration;
		let deathPointX = this.calculPosX(frameNb);

		// room.broadcast(JSON.stringify({
		// 	event: "DeathPointUpdate",
		// 	data: deathPointX
		// }));

		setTimeout(() => {
			
			// checking if the paddle hits the puck...
			// let paddlePos = (this.vectorY > 0) ? room.pong.paddlePos[1] : this.gameWidth - room.pong.paddlePos[0];
			let paddlePos = (this.vectorY > 0) ? room.pong.paddlePos[1] : room.pong.paddlePos[0];
			if (deathPointX > paddlePos && deathPointX < paddlePos + room.pong.gameMap.paddleSize) {
			// line below is to make the puck bounce permantly
			// if (this.vectorY) {
				console.log("Puck Hit.");
				
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
	
				let winner = (this.vectorY > 0) ? 0 : 1;
				room.broadcast(JSON.stringify({
					event: "ScoreUpdate",
					data: (this.vectorY > 0) ? 0 : 1
				}));
				room.scores[winner]++;

				console.log("Actual score: ", room.scores[0], ":", room.scores[1]);
				if (room.scores[0] == room.maxpoint || room.scores[1] == room.maxpoint) {
					room.broadcast(JSON.stringify({
						event: "GameFinished",
						data: (room.scores[0] > room.scores[1]) ? 0 : 1
					}));

					// TODO Save the game to the database
					room.putScore();
					return ;
				}

				room.pong.puck = new Puck(room.pong.gameMap.width, room.pong.gameMap.height, room.difficulty);
				setTimeout(() => {
					Room.startPong(room);
				}, 1000);
			}
		}, timeOut);
	}

	calculPosX(frameNb: number) {
		// TODO precision should be made, it should be because of the css stuff
		let deathPointX = this.posX;

		for (let i = 0; i < frameNb; i++) {
			deathPointX += this.vectorX;
			if (deathPointX < 0 || deathPointX > this.gameWidth - 30) {
				this.vectorX *= -1;
				deathPointX += this.vectorX;
			}
		}
		return (deathPointX);
	}
}