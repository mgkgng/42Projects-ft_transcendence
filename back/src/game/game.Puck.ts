import { Room } from "./game.Room";
import { PaddleSize, PongConfig, PuckSpeed } from "./game.utils";

export class Puck {
	puckSpeed: number;
	pos: Array<number>;
	vec: Array<number>;
	mapSize: Array<number>;
	initialized: boolean;
	time_puck : number = 0;
	deathPointX : number = 0;

	constructor(mapSize : Array<number>, puckSpeed: number) { // temporary test
		this.puckSpeed = puckSpeed;
		this.vec = [(Math.floor(Math.random() * 4) + 1) * ((Math.floor(Math.random() * 2)) ? 1 : -1),
			puckSpeed * ((Math.floor(Math.random() * 2)) ? 1 : -1)];
		this.mapSize = mapSize;
		this.pos = [mapSize[0] / 2, mapSize[1] / 2];
		this.initialized = true;
	}

	init_time_hit()
	{
		let timeNow : Date = new Date();
		let distToDeath = (this.mapSize[1] / 2 - PongConfig.DeadZoneHeight) * 2;
		if (this.initialized) {
			distToDeath /= 2;
			this.initialized = false;
		}
		let frameNb = Math.round(distToDeath / Math.abs(this.vec[1]));
		this.deathPointX = this.calculPosX(frameNb);
		this.time_puck = (timeNow).getTime() +  frameNb * PongConfig.FrameDuration + 2000;
	}
	puck_it(room, time)
	{
		if (Math.abs(time - this.time_puck) > 20)
			return (false);
		let player = room.players.get(room.playerIndex[(this.vec[1] > 0) ? 1 : 0]);
		if (!player || room.isOver)
			return (true);
		let paddlePos = player.paddle.pos;
		// console.log(paddlePos, deathPointX);
		if (this.deathPointX >= paddlePos - PongConfig.PaddleBumper && this.deathPointX <= paddlePos + PaddleSize[room.gameInfo.paddleSize] + PongConfig.PaddleBumper) {
			// if paddle hits the puck
			this.pos[0] = this.deathPointX;
			this.pos[1] = (this.vec[1] > 0) ? (this.mapSize[1] - PongConfig.DeadZoneHeight)
				: PongConfig.DeadZoneHeight;
			this.vec[1] += (this.vec[1] > 0) ? 1 : -1;
			this.vec[1] *= -1;
			room.broadcast("PuckHit");
			this.setCheckPuck(room);
			return (false);
		} else {
			// if not, update the score, if the score reached the max point, finish the match
			let winner = (this.vec[1] > 0) ? room.players.get(room.playerIndex[0]) : room.players.get(room.playerIndex[1]);
			if (!winner || room.isOver)
				return ;
			room.broadcast("ScoreUpdate", winner?.info.username);
			winner.score++;

			if (winner.score == room.gameInfo.maxPoint) {
				room.broadcast("GameFinished",  winner.info.username);
				room.endGame(winner.info.username);
				return ;
			}
			setTimeout(() => { Room.startPong(room); }, 2000);
		}
		return (true);
	}
	setCheckPuck(room: any) {
		if (room.isOver)
			return ;
		let distToDeath = (this.mapSize[1] / 2 - PongConfig.DeadZoneHeight) * 2;
		if (this.initialized) {
			distToDeath /= 2;
			this.initialized = false;
		}

		let frameNb = Math.round(distToDeath / Math.abs(this.vec[1]));
		let timeOut = frameNb * PongConfig.FrameDuration;
		let deathPointX = this.calculPosX(frameNb);

		setTimeout(() => {
			let player = room.players.get(room.playerIndex[(this.vec[1] > 0) ? 1 : 0]);
			if (!player || room.isOver)
				return ;
			let paddlePos = player.paddle.pos;
			// console.log(paddlePos, deathPointX);
			if (deathPointX >= paddlePos - PongConfig.PaddleBumper && deathPointX <= paddlePos + PaddleSize[room.gameInfo.paddleSize] + PongConfig.PaddleBumper) {
				// if paddle hits the puck
				this.pos[0] = deathPointX;
				this.pos[1] = (this.vec[1] > 0) ? (this.mapSize[1] - PongConfig.DeadZoneHeight)
					: PongConfig.DeadZoneHeight;
				// this.vec[1] += (this.vec[1] > 0) ? 1 : -1;
				this.vec[1] *= -1;
				room.broadcast("PuckHit");
				this.setCheckPuck(room);
				return ;
			} else {
				// if not, update the score, if the score reached the max point, finish the match
				let winner = (this.vec[1] > 0) ? room.players.get(room.playerIndex[0]) : room.players.get(room.playerIndex[1]);
				if (!winner || room.isOver)
					return ;
				room.broadcast("ScoreUpdate", winner?.info.username);
				winner.score++;

				if (winner.score == room.gameInfo.maxPoint) {
					room.broadcast("GameFinished",  winner.info.username);
					room.endGame(winner.info.username);
					return ;
				}

				setTimeout(() => { Room.startPong(room); }, 2000);
			}
		}, timeOut);
	}

	calculPosX(frameNb: number) {
		let deathPointX = this.pos[0];

		for (let i = 0; i < frameNb; i++) {
			deathPointX += this.vec[0];
			if (deathPointX < 0) {
				deathPointX *= -1;
				this.vec[0] *= -1;
			} else if (deathPointX > this.mapSize[0] - PongConfig.PuckSize / 2) {
				deathPointX = this.mapSize[0] - PongConfig.PuckSize / 2 - (deathPointX - this.mapSize[0] + PongConfig.PuckSize / 2);
				this.vec[0] *= -1;
			}
		}
		return (deathPointX);
	}
}