<style lang="scss">
	.container {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		width: 90vw;
		height: 90vh;
		padding: 2em 0;

		border: solid 2px transparentize(#fff, 0.65);
		background-color: transparentize(#313131, 0.15);
		border-radius: .5em;

		gap: 1em;
	}

	.pong {
		position: relative;
		padding: 0;
		gap: .2em;
		height: 100%;
		width: 90%;

		display: flex;
		justify-content: center;

		.side {
			width: 6em;
			height: 100%;
			align-items: center;
			gap: .2em;

			h1 {
				color: #fff;
				font-size: 65px;
			}
		}
		.right {
			flex-direction: column-reverse;
		}
	}
	
	.loading-box {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;

		color: #fff;
	}

	.button-container {
		padding: .2em;

		button {
			width: 8em;
			height: 3em;
			color: #fff;
			border: solid 2.5px #fff;
			border-radius: .5em;
			background-color: transparentize(#fff, 0.8);
			cursor: pointer;
			transition: .2s;

			&:hover {
				filter: brightness(70%);
				border-color: transparentize(#fff, .4);
			}
		}

		.start:hover { background-color: $submain-blue; }
		.ready:hover { background-color: $yellow; }
		.exit:hover { background-color: $main-dark; }
	}

	.pong-game {
		position: relative;
		height: 100%;
		width: 100%;
		border: $border;

		padding: 0;
		border-radius: .5em;

		background-color: #212121;

		.zone-limit {
			position: absolute;
			width: var(--width);
			height: 100%;
		}
	
		.left {
			left: 0;
			// box-shadow: 1px 0px 120px 50px rgba(0,255,255,0.5), 
			//       2px 0px 4px rgba(0,255,255,0.5), 
			//       4px 0px 8px rgba(0,255,255,0.5), 
			//       var(--shadow);
		}
	
		.right {
			right: 0;
		}
	
		.paddle {
			position: absolute;
			margin: 0;
			width: 12px;
			background-color: #fff;
	
			border-radius: .2em;
	
			z-index: 2;
	
			// border: 5px solid $red;
			box-shadow: 0px 0px 5px 5px $main-bright;
		}
	
		.absent {
			background-color: rgb(90, 84, 84);
			box-shadow: none;
		}
	
		.user {
			margin: 0;
			box-shadow: 0px 0px 5px 5px $submain-blue;
		}
	}

	.puck, .shadow {
		position: absolute;
		margin: 0;
		width: 16px;
		z-index: 1;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: #fff;
	}

	.puck {
		box-shadow: 0px 0px 5px 3px $yellow;
	}

	.shadow {
		opacity: var(--opacity);
	}

</style>

<script lang="ts">
	import { afterUpdate, onMount } from 'svelte';
	import { client } from "$lib/stores/client";
	import { UserType, MapSize, PaddleSize, PongConfig } from '$lib/stores/var';
	import { Puck } from '$lib/pong/Puck';
    import Modal from '$lib/tools/Modal.svelte';
    import GameOver from '$lib/game/GameOver.svelte';
    import ConfirmMsg from '$lib/modals/ConfirmMsg.svelte';
    import { user } from '$lib/stores/user';
    import Player from '$lib/game/Player.svelte';
	import AlertMessage from '$lib/modals/AlertMessage.svelte';

	export let roomID: string;
	export let itself: any;	

	let puck: any = undefined;
	let moving: boolean = false;

	let userType: number;
	let initPos: number;

	let quitConfirmMsgModal: any;

	let puckMoving: any;
	
	let gameFinishedModal: any;
	let alertMessageModal: any;
	let alertMessage: string;

	let ready: boolean = false;
	let started: boolean = false;

	let winner: any;

	/* Room Info */
	let game: any;
	let gameInfo: any;
	let gameSize: any;
	let gameReady: boolean = false;
	let tryStart: boolean = false;
	let hostname: string;
	let player1: any = undefined;
	let player2: any = undefined;
	let invited: any = undefined;

	let switched: boolean = false;
	let update: boolean = false;
	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	$: console.log("this is the roomID", roomID);
	
	let paddleWidth: number;
	let posHorizontal: Array<number>;
	let prevY: number = 0;
	let zoneLimitWidth: number = 20;

	let isMouseMoveDisabled = false;

	$: puckPos = translatePucks(puck);
	$: setGame(gameReady, game);

	function setGame(gameReady: boolean, domReady: any) {
		if (gameReady && domReady !== undefined) {
			// game = document.getElementById("pong-game");
			gameSize = game.getBoundingClientRect();
			defineValues();
			gameReady = true;
		}
	}

	function convertPixelWithHeight(where: number) {
		if (!gameSize)
			return (initPos);
		return (Math.floor((gameSize.height * where) / MapSize[gameInfo.mapSize][0]));
	}

	function convertPixelWithWidth(where: number) {
		if (!gameSize)
			return (initPos);
		return (Math.floor((gameSize.width * where) / MapSize[gameInfo.mapSize][1]));
	}

	function convertFromPixelWithHeight(pixel: number) {
		if (!gameSize)
			return (initPos);
		return (Math.floor((pixel * MapSize[gameInfo.mapSize][0]) / gameSize.height));
	}

	function defineValues() {
		if (!gameSize)
			return ;
		paddleWidth = convertPixelWithHeight(PaddleSize[gameInfo.paddleSize]);
		initPos = convertPixelWithHeight((MapSize[gameInfo?.mapSize][0] - PaddleSize[gameInfo?.paddleSize]) / 2);
		zoneLimitWidth = convertPixelWithWidth(PongConfig.DeadZoneHeight);
		let test = convertPixelWithWidth(PongConfig.DeadZoneHeight) - 12;
		posHorizontal = [test, convertPixelWithWidth(MapSize[gameInfo.mapSize][1] - PongConfig.DeadZoneHeight)];
		console.log(posHorizontal);
	}

	function translatePucks(puck: any) {
		if (!puck)
			return ;
		let res = [];
		for (let pos of puck.pos) {
			res.push([
				(!switched) ? convertPixelWithHeight(pos[0]) : convertPixelWithHeight(MapSize[gameInfo.mapSize][0] - pos[0]),
				(!switched) ? convertPixelWithWidth(MapSize[gameInfo.mapSize][1] - pos[1]) : convertPixelWithWidth(pos[1])
			]);
		}
		return (res);
	}

	window.addEventListener('resize', () => {
		gameSize = game?.getBoundingClientRect();
		defineValues();
	});

	afterUpdate(() => {
		update = true;
	})

	onMount(()=> {
		if (!roomID)
			return ;
		
		$client.socket.on("RoomFound", (data: any) => {
			console.log("RoomFound", data);

			// Get room information
			console.log(userInfo);
			gameInfo = data.gameInfo;
			hostname = data.hostname;
			if (!hostname.length)
				started = true;
			player1 = data.player1;
			player2 = data.player2;
			invited = data.invited;
			userType = (player1?.info.username_42 == userInfo.username_42) ? UserType.Player1 :
				(player2?.info.username_42 == userInfo.username_42) ? UserType.Player2 :
				UserType.Watcher;
			// By default, player1 is on the right side unless user is the player2
			switched = (userInfo.username_42 == player2?.info.username_42);
			gameReady = true;
		});

		$client.socket.on("PlayerUpdate", (data: any) => {
			console.log("PlayerUpdate", data);
			if (data.join) {
				player2 = data.player;
			} else {
				if (started) {
					clearInterval(puckMoving);
					return ;
				}
				if (data.username == player1.info.username_42)
					player1 = undefined;
				else
					player2 = undefined;
				hostname = data.hostname;
			}
		});
		
		$client.socket.on("PaddleUpdate", (data: any) => {
			if (data.type === 0)
				player1.pos = data.pos;
			else
				player2.pos = data.pos;
		});

		$client.socket.on("LoadBall", (data: any) => { puck = new Puck(data.vec, data.pos, MapSize[gameInfo.mapSize]); });

		$client.socket.on("PongStart", () => {
			clearInterval(puckMoving)
			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 40);
		});

		$client.socket.on("PuckHit", (data: any) => {
			console.log("Puck hit received");
			puck.vec[1] += (puck.vec[1] > 0) ? 1 : -1;
			puck.vec[1] *= -1;
			puck = puck;
			console.log("=================");
		});

		$client.socket.on("ScoreUpdate", (data: any) => {
			// Destroy puck
			clearInterval(puckMoving);
			puck = undefined;

			// Update Score
			if (player1.info.username == data)
				player1.score++;
			else
				player2.score++;
		});

		$client.socket.on("ReadyUpdate", (data: any) => { ready = data; });

		$client.socket.on("GameFinished", (data: any) => {
			clearInterval(puckMoving);
			puck = undefined;
			winner = data;
			gameFinishedModal.open();
		});

		$client.socket.on("GameStartFail", () => { tryStart = false; });
		$client.socket.on("GameStart", () => { started = true });

		$client.socket.emit("RoomCheck", roomID);

		console.log("onMount is here");

		return (() => {
			if (puckMoving)
				clearInterval(puckMoving);
			$client.socket.off("RoomFound");
			$client.socket.off("PlayerUpdate");
			$client.socket.off("PaddleUpdate");
			$client.socket.off("LoadBall");
			$client.socket.off("PongStart");
			$client.socket.off("PuckHit");
			$client.socket.off("ScoreUpdate");
			$client.socket.off("ReadyUpdate");
			$client.socket.off("GameFinished");
			$client.socket.off("GameStartFail");
			$client.socket.off("GameStart");
		});
	});
</script>

{#if gameInfo}
<div class="container">
	<!-- <div class="flex pong" style="width: {MapSize[gameInfo.mapSize][1] + 200}px; height: {MapSize[gameInfo.mapSize][0]}px;"> -->
	<div class="flex pong">
		<div class="vflex side">
			<Player player={(!switched) ? player2 : player1} left={true} hostname={hostname} invited={invited} ready={ready}/>	
			<h1>{(!switched && player2) ? player2.score : ((!switched && !player2) || (switched && !player1)) ? "0" : player1?.score}</h1>
		</div>
		<div bind:this={game} class="pong-game">
			{#if gameSize}
				<div class="zone-limit left {(!switched) ? "player2" : "player1"}" style="--width: {zoneLimitWidth}px"></div>
				<!-- Player 1 Paddle -->
				<div class="paddle {(!player1) ? "absent" : ""}"
					style="left: {posHorizontal[(!switched) ? 1 : 0]}px;
					top: {(!player1) ? initPos : (!switched) ? convertPixelWithHeight(player1?.pos) : convertPixelWithHeight(MapSize[gameInfo?.mapSize][0] - player1?.pos - PaddleSize[gameInfo.paddleSize])}px;
					height: {paddleWidth}px">
				</div>
				<!-- Player 2 Paddle -->
				<div class="paddle {(!player2) ? "absent" : ""}"
					style="left: {posHorizontal[(!switched) ? 0 : 1]}px;
					top: {(!player2) ? initPos : (!switched) ? convertPixelWithHeight(player2?.pos) : convertPixelWithHeight(MapSize[gameInfo?.mapSize][0] - player2?.pos - PaddleSize[gameInfo?.paddleSize])}px;
					height: {paddleWidth}px">
				</div>
				<div class="zone-limit right {(!switched) ? "player1" : "player2"}" style="--width: {zoneLimitWidth}px"></div>

				{#if puckPos}
					{#if puckPos.length > 4}
					<div class="shadow" style="top: {puckPos[4][0]}px; left: {puckPos[4][1]}px; --opacity: 15%"></div>
					{/if}
					{#if puckPos.length > 3}
					<div class="shadow" style="top: {puckPos[3][0]}px; left: {puckPos[3][1]}px; --opacity: 25%"></div>
					{/if}
					{#if puckPos.length > 2}
					<div class="shadow" style="top: {puckPos[2][0]}px; left: {puckPos[2][1]}px; --opacity: 40%"></div>
					{/if}
					{#if puckPos.length > 1}
					<div class="shadow" style="top: {puckPos[1][0]}px; left: {puckPos[1][1]}px; --opacity: 60%"></div>
					{/if}
					{#if puckPos.length}
					<div class="puck" style="top: {puckPos[0][0]}px; left: {puckPos[0][1]}px;"></div>
					{/if}
				{/if}


			{/if}
		</div>
		<div class="vflex side right">
			<Player player={(!switched) ? player1 : player2} left={false} hostname={hostname} invited={undefined} ready={ready}/>
			<h1>{(!switched && player1) ? player1?.score : (player2) ? player2.score : "0"}</h1>
		</div>
	</div>
	<div class="button-container">
		<!-- there should be a difference between host-guest mode and random matching mode -->
		{#if !started && hostname.length}
			{#if userInfo.username_42 == hostname}
			<button class="start" on:click={()=>{
				if (!ready) {
					alertMessage = "The guest is not ready yet";
					alertMessageModal.open();
					return ;
				}
				tryStart = true;
				$client.socket.emit("StartGame", roomID)
			}}>START</button>
			{:else if player1?.info.username_42 == userInfo.username_42 || player2?.info.username_42 == userInfo.username_42}
			<button class="ready" on:click={()=>{
				$client.socket.emit("isReady", {
					roomID: roomID,
					isReady: !ready,
				});
			}}>{(!ready) ? "READY" : "CANCEL"}</button>
			{/if}
		{/if}
		<button class="exit" on:click={()=>{ quitConfirmMsgModal.open(); }}>EXIT</button>
	</div>
</div>
{:else}
<div class="loading-box">
	<h1 class="msg">LOADING...</h1>
</div>
{/if}

<Modal bind:this={gameFinishedModal} closeOnBgClick={false}>
	<GameOver winner={(winner == player1.info.username) ? player1 : player2} gameModal={itself} itself={gameFinishedModal} scores={[player1?.score, player2?.score]}/>
</Modal>

<Modal bind:this={quitConfirmMsgModal} closeOnBgClick={false}>
	<ConfirmMsg msg={"Are you sure you want to quit?"} toQuit={itself} roomID={roomID} itself={quitConfirmMsgModal}/>
</Modal>

<Modal bind:this={alertMessageModal}>
	<AlertMessage msg={alertMessage} itself={alertMessageModal} />
</Modal>

<!-- <svelte:window
	on:mousemove={(event) => {
		if (isMouseMoveDisabled === true)
			return ;
		if (![player1?.info.username_42, player2?.info.username_42].includes(userInfo.username_42))
			return ;
		if (!gameSize)
			return ;
		let pos = Math.floor(event.clientY - gameSize?.y) - paddleWidth / 2;
		if (pos < 0)
			pos = 0;
		if (pos > gameSize.height - paddleWidth)
			pos = gameSize.height - paddleWidth;
		
		let posConverted = Math.floor(convertFromPixelWithHeight((!switched) ? pos : gameSize.height - pos - paddleWidth));
		if (posConverted == prevY)
			return ;
		prevY = posConverted;
		$client.socket.emit("PaddleMoveMouse", {
			pos: posConverted,
			roomID: roomID
		});
		if (player1.info.username_42 === userInfo.username_42)
			player1.pos = posConverted;
		else
			player2.pos = posConverted;
		isMouseMoveDisabled = true;
        setTimeout(() => {
            isMouseMoveDisabled = false;
        }, 20);

	}}
/> -->

<svelte:window
on:keypress={(event) => {
	if (
		// userType == UserType.Watcher ||
		(event.code != 'KeyA' && event.code != 'KeyD'))
	return ;
	if (moving) //* TODO should make movement more fluent
		return ;
	moving = true;
	$client.socket.emit("PaddleMoveKey", {
		room: roomID,
		left: (userType == UserType.Player1 && event.code == 'KeyD'
			|| userType == UserType.Player2 && event.code == 'KeyA')
	});
}}
on:keyup={(event)=>{
	if (event.code != 'KeyA' && event.code != 'KeyD')
		return ;
	
	//* TODO some precision to make
	$client.socket.emit("PaddleStopKey", roomID);
	moving = false;
}}
/>

