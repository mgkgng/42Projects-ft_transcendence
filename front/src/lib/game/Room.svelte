<style lang="scss">
	.container {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		min-width: 850px;
		min-height: 850px;

		border: dashed 2px #fff;
	}

	.pong {
		position: relative;

		padding: 0;
		border: solid 3px white;
		border-radius: 2.5em;

		background-color: transparentize(#000, .2);
		// display: flex;
		// justify-content: center;
		// align-items: center;
	}

	.test {
		position: absolute;
		width: 10px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: blue;

		z-index: 4;
	}

	.bar-container-above {
		position: relative;
		display: flex;
		align-items: center;
	}

	.bar-container-below {
		position: relative;
		display: flex;
		align-items: center;
	}

	.central-line-vertical {
		position: absolute;
		left: 50%;
		height: 100%;
		border: dashed 3px aqua;
	}

	.central-line-horizontal {
		position: absolute;
		top: 50%;
		width: 100%;
		height: 0;
		border: dashed 3px aqua;
	}


	.beyond-above {
		background-color: transparentize($main, 0.2);
		border-radius: 5em 5em 0 0;
	}

	.beyond-below {
		background-color: transparentize($main, 0.2);
		border-radius: 0 0 5em 5em;
	}

	.map {
		display: flex;
		background-color: transparentize($main, 0.9);
	}

	.main-circle {
		width: 50%;
		height: 50%;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: transparentize($main, 0.2)
	}

	.pong-score {
		display: flex;
		flex-direction: column;

		justify-content: center;
		height: 100%;

		gap: 1em;
	}

	.deathPoint {
		position: absolute;
		width: 12px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		background-color: peru;
		z-index: 10;
	}

	.loading-box {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.msg {
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
		}
	}

	.mini-mode {
		position: absolute;
		right: 0;
		top: 0;
		width: 25px;
		aspect-ratio: 1 / 1;
		border-radius: 20%;
		background-color: transparentize(#fff, 0.2);
		transition: .4s;
		font-size: 25px;

		&:hover {
			transform: scale(1.2);
		}
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from "$lib/stores/client";
	import { UserType } from '$lib/stores/var';
	import Paddle from '$lib/game/Paddle.svelte';
	import { Puck } from '$lib/pong/Puck';
    import PongPuck from '$lib/game/PongPuck.svelte';
    import ScoreBox from '$lib/game/ScoreBox.svelte';
    import Modal from '$lib/tools/Modal.svelte';
    import GameOver from '$lib/modals/GameOver.svelte';
    import ConfirmMsg from '$lib/modals/ConfirmMsg.svelte';
    import { user } from '$lib/stores/user';

	export let roomId: string;
	export let itself: any;

	let roomInfo: any;

	// let gameMap = new GameMap(mapWidth.Small, mapHeight.Small, PaddleSize.Medium);

	// TODO GameMap info should go into the pong's constructor
	let puck: any = undefined;
	let scores: Array<number> = [0, 0];

	let userType: number;
	let userIndex: number = UserType.Player1;
	let opponentIndex: number = UserType.Player2;

	let initPos = (roomInfo?.mapSize[0] + roomInfo?.paddleSize) / 2;
	let paddlePos: Array<number> = [initPos, initPos];

	let quitConfirmMsgModal: any;
	let resQuitConfirm: boolean;

	let grapped = false;
	let deathPoint: number;
	let moving = false;
	let puckMoving: any;
	
	let gameFinishedModal: any;

	let roomFound: boolean;
	let miniMode: boolean = false;

	$: quitRoom(resQuitConfirm);

	function quitRoom(res: boolean) {
		if (res == false)
			quitConfirmMsgModal.close();
		else if (res == true)
			itself.close();
	}

	onMount(()=> {
		$client.socket.emit("RoomCheck", {
			client: $client.id,
			room: roomId
		});

		$client.socket.off("RoomInfo", (data: any) => {
		});
		$client.socket.on("RoomInfo", (data: any) => {
			console.log("RoomInfo", data);
			roomFound = true;
			roomInfo = data;
		});

		// plus tard je le rends plus beau
		if (roomInfo?.players.length > 1)
			userType = UserType.Player1;
		else
			userType = ($client.id == roomInfo?.players[0]) ? UserType.Player1 
				: ($client.id == roomInfo?.players[1]) ? UserType.Player2 
				: UserType.Watcher;

		if (userType == UserType.Player2) {
			[userIndex, opponentIndex] = [opponentIndex, userIndex];
			// TODO (this is kinda brut force)
			paddlePos[0] -= roomInfo?.paddleSize, paddlePos[1] -= roomInfo?.paddleSize;
		}

		scores = roomInfo?.scores;
		
		$client.socket.off("PaddleUpdate", (data: any) => {
		});
		$client.socket.on("PaddleUpdate", (data: any) => {
			console.log("PaddleUpdate", data);
			if ((data.player == UserType.Player1 && userIndex == UserType.Player2) ||
				(data.player == UserType.Player2 && userIndex == UserType.Player2))
				paddlePos[data.player] = data.paddlePos;
			else
				paddlePos[data.player] = roomInfo?.mapSize[0] - data.paddlePos;

			// data.paddlePos;
		});

		$client.socket.off("LoadBall", (data: any) => {
		});
		$client.socket.on("LoadBall", (data: any) => {
			console.log("LoadBall");
			puck = new Puck(roomInfo?.mapSize[0], roomInfo?.mapSize[1], data.vectorX, data.vectorY);
		});

		$client.socket.on("PongStart", (data: any) => {
		});
		$client.socket.on("PongStart", (data: any) => {
			console.log("PongStart", data);

			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 20);
		});

		$client.socket.off("DeathPointUpdate", (data: any) => {
		});
		$client.socket.on("DeathPointUpdate", (data: any) => {
			console.log("DeathPointUpdate");
			deathPoint = data;
		});

		$client.socket.off("PuckHit", (data: any) => {
		});
		$client.socket.on("PuckHit", (data: any) => {
			console.log("PuckHit");
			puck.vectorY *= -1;
		});
 
		$client.socket.off("ScoreUpdate", (data: any) => {
		});
		$client.socket.on("ScoreUpdate", (data: any) => {
			console.log("ScoreUpdate", data);
			clearInterval(puckMoving);
			scores[data]++;
			puck = undefined;
		});

		$client.socket.off("GameFinished", (data: any) => {
		});
		$client.socket.on("GameFinished", (data: any) => {
			console.log("GameFinished");
			console.log((userType == data) ? "You Win!"
				: (userType != UserType.Watcher) ? "You Lose!" 
				: ".");
			gameFinishedModal.open();
		});
	});

</script>

{#if !miniMode}
{#if roomFound}
<div class="container">
	{#if roomInfo}
	<div class="pong" style="min-width: {roomInfo?.mapSize[0]}px; min-height: {roomInfo?.mapSize[1]}px;">
		{#if roomInfo.players.length > 1}
		<Paddle pos={paddlePos[opponentIndex]} paddleWidth={roomInfo?.paddleSize}
			gameWidth={roomInfo?.mapSize[0]} gameHeight={roomInfo?.mapSize[1]}
			user={false} userIndex={userIndex}/>
		{/if}
		<!-- <div class="test" style="left: {paddlePos[opponentIndex]}px; top: 50px;"></div> -->
		{#if puck}
		<PongPuck posX={(userIndex == UserType.Player1) ? roomInfo?.mapSize[0] - puck.posX : puck.posX}
			posY={(userIndex == UserType.Player1) ? roomInfo?.mapSize[1] - puck.posY : puck.posY} />
		{/if}
		<Paddle pos={paddlePos[userIndex]} paddleWidth={roomInfo?.paddleSize}
			gameWidth={roomInfo?.mapSize[0]} gameHeight={roomInfo?.mapSize[1]}
			user={true} userIndex={userIndex}/>
		<!-- <div class="test" style="left: {paddlePos[userIndex]}px; top: {roomInfo?.mapSize[1] - 50}px;
		"></div> -->
<!-- 
		{#if deathPoint && puck}
		<div class="deathPoint"
			style="left: {deathPoint}px;
			top: {(puck.vectorY < 0 && userIndex || puck.vectorY > 0 && !userIndex) ? 50 : roomInfo?.mapSize[1] - 50}px;"></div>
		{/if} -->
		<!-- <div class="central-line-vertical"></div>
		<div class="central-line-horizontal"></div>	 -->
		<div class="pong-score">
		<!-- solution for now, later it will be an empty score box with question mark -->
			{#if roomInfo.players.length > 1}
			<ScoreBox score={scores[opponentIndex]}/>
			<ScoreBox score={scores[userIndex]}/>
			{/if}
		</div>
	</div>
	{/if}
	<div class="button-container">
		<!-- there should be a difference between host-guest mode and random matching mode -->
		{#if $user.username == roomInfo.roomHost}
		<button>START</button>
		{:else if userType == UserType.Player2}
		<button>READY</button>
		{/if}
		<button on:click={()=>{ quitConfirmMsgModal.open(); }}>EXIT</button>

	</div>
	<button class="mini-mode" on:click={()=>{
		miniMode = true;
	}}>_</button>
</div>
{:else}
<div class="loading-box">
	<h1 class="msg">LOADING...</h1>
</div>
{/if}
{:else}
what is this?
{/if}

<Modal bind:this={gameFinishedModal} closeOnBgClick={false}>
	<GameOver />
</Modal>

<Modal bind:this={quitConfirmMsgModal} closeOnBgClick={false}>
	<ConfirmMsg msg={""} result={resQuitConfirm}/>
</Modal>

<svelte:window
on:mouseup={()=>{
	grapped = false;
}}

on:mousemove={(event)=>{
	if (grapped)
		console.log(event);
}}

on:keypress={(event) => {
	if (userType == UserType.Watcher
	|| (event.code != 'KeyA' && event.code != 'KeyD'))
		return ;

	if (moving)
		return ;

	moving = true;

	$client.socket.emit("PaddleMove", {
		client: $client.id,
		player: userType,
		room: roomId,
		left: (userType == UserType.Player1 && event.code == 'KeyD'
			|| userType == UserType.Player2 && event.code == 'KeyA')
	});
}}

on:keyup={(event)=>{
	if (event.code != 'KeyA' && event.code != 'KeyD')
		return ;
	
	//* TODO some precision to make
	$client.socket.emit("PaddleStop", $client.id)

	moving = false;
}}

/>