import { Room } from "./game.Room";
import { MapHeight } from "./game.utils";

export class Puck {
	posX: number;
	posY: number;
	vectorX: number;
	vectorY: number;
	gameWidth: number;
	gameHeight: number;

	constructor(gameWidth : number, gameHeight : number,
		//vectorX : number = (Math.floor(Math.random() * 6) + 1) * ((Math.floor(Math.random() * 2)) ? 1 : -1), 
		//vectorY: number = (Math.floor(Math.random() * 2)) ? 3 : -3) { // temporary test
		vectorX : number = 2,
		vectorY: number = -3){
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
		let deadZoneHeight = 30;
		let paddleHeight = 12;
		let ballSize = 30;

		let distToDeath = (this.vectorY > 0)
			? (this.gameHeight - deadZoneHeight - paddleHeight) - this.posY - 30
			: this.posY - deadZoneHeight - paddleHeight - 30;

		let timeOut = Math.abs((distToDeath/this.vectorY)) * frameDuration;
		let deathPointX = this.calculPosX();
		console.log("Pos death: ", this.calculPosX());
		console.log("POS: ", this.posX, this.posY);
		room.broadcast(JSON.stringify({
			event: "DeathPointUpdate",
		 	data: deathPointX
		 }));
		console.log("Timeout:", timeOut);
		setTimeout(() => {
			
			// checking if the paddle hits the puck...
			// let paddlePos = (this.vectorY > 0) ? room.pong.paddlePos[1] : this.gameWidth - room.pong.paddlePos[0];
			let paddlePos = (this.vectorY > 0) ? room.pong.paddlePos[1] : room.pong.paddlePos[0];
			if ((this.vectorY > 0)
				|| (this.vectorY < 0)){
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

				room.pong.puck = new Puck(room.pong.gameMap.width, room.pong.gameMap.height);
				setTimeout(() => {
					Room.startPong(room);
				}, 1000);
			}
		}, timeOut);
	}
 	calculPosX() {
	 	// TODO precision should be made, it should be because of the css stuff
		let y_final = (this.vectorY > 0) ? (this.gameHeight - 30 - 15 - 12) : (30 + 15 + 12);
		let y_inter = this.posY + 15; //center position of ball
		let x_inter = this.posX + 15;
		let vectorX_inter = this.vectorX;
		if	(this.vectorX == 0) //if he is up/down
			return (this.posX);
		let b = 0; // b for ax + b = y
		while ((y_inter < y_final && this.vectorY > 0) || (y_inter > y_final && this.vectorY < 0))
		{
			b = y_inter - (this.vectorY / vectorX_inter) * x_inter;
			y_inter =  (vectorX_inter > 0 ? (this.vectorY / vectorX_inter) * (this.gameWidth - 15) : 15) + b;
			x_inter = (vectorX_inter > 0 ? (this.gameWidth - 15) : 15);
			vectorX_inter *= -1;
		}
		return ((y_final - b) / (this.vectorY / vectorX_inter) * -1) + (vectorX_inter * -1 > 0 ? -15 : 15);
	}
	// 	return (deathPointX);
	// }
	// calculPosX() {
	// 	// TODO precision should be made, it should be because of the css stuff
	// 	let distToDeath = (this.vectorY > 0)
	// 		? (this.gameHeight - 30 - 12) - this.posY
	// 		: this.posY - 30 - 12; 
	// 	let deathPointX = this.posX;
	// 	let vecX = this.vectorX;

	// 	let inc = Math.abs(this.vectorY);
	// 	for (let i = 0; i < distToDeath / 20; i++) {
	// 		deathPointX += vecX;
	// 		if (deathPointX < 0 || deathPointX > this.gameWidth - 30) {
	// 			vecX *= -1;
	// 			deathPointX += vecX;
	// 		}
	// 		// console.log(deathPointX);
	// 	}

	// 	return (deathPointX);
	// }
}