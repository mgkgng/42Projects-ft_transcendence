<style lang="scss">
	.container {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		min-width: 950px;
		padding: 2em 0;
		//height: 750px;

		border: solid 2px transparentize(#fff, 0.65);
		background-color: transparentize(#313131, 0.15);
		border-radius: .5em;

		gap: 1em;
	}

	.pong {
		position: relative;
		padding: 0;
		gap: .2em;

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
	
	.pong-game {
		position: relative;

		padding: 0;
		border-radius: .5em;

		background-color: #212121;
	}

	.loading-box {
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
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

	.mini-mode {
		position: absolute;
		right: .5em;
		top: 0;
		width: 25px;
		height: 30px;
		aspect-ratio: 1 / 1;
		border-radius: 0 0 .2em .2em;
		transition: .4s;
		font-size: 25px;
		padding-bottom: .5em;
		text-align: center;
		cursor: pointer;

		&:hover {
			color: #fff;
			background-color: transparentize(#fff, 0.8);
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
    import Modal from '$lib/tools/Modal.svelte';
    import GameOver from '$lib/modals/GameOver.svelte';
    import ConfirmMsg from '$lib/modals/ConfirmMsg.svelte';
    import { user } from '$lib/stores/user';
    import Player from '$lib/game/Player.svelte';

	export let roomId: string;
	export let itself: any;	

	let roomInfo: any;

	let puck: any = undefined;
	let scores: Array<number> = [0, 0];

	let userType: number;
	let userIndex: number = UserType.Player1;
	let opponentIndex: number = UserType.Player2;

	let initPos: number;
	let paddlePos: Array<number>;

	let quitConfirmMsgModal: any;

	let grapped = false;
	let deathPoint: number;
	let moving = false;
	let puckMoving: any;
	
	let gameFinishedModal: any;

	let roomFound: boolean;
	let miniMode: boolean = false;

	let ready: boolean = false;
	let tryStart: boolean = false;
	let gameStart: boolean = false;

	let winner: any;

	onMount(()=> {
		$client.socket.emit("RoomCheck", {
			client: $client.id,
			room: roomId
		});

		$client.socket.on("RoomInfo", (data: any) => {
			console.log("RoomInfo", data);
			roomFound = true;
			roomInfo = data; // maybe need some protection?
			initPos = (roomInfo?.mapSize[0] + roomInfo?.paddleSize) / 2;
			paddlePos = [initPos, initPos];

			userType = ($user.username == roomInfo?.players[0].username_42) ? UserType.Player1 :
				(roomInfo.players.length > 1 && $user.username == roomInfo.players[1].username_42) ? UserType.Player2 : //TODO 42 wtf???
				UserType.Player2;
			
			if (userType == UserType.Player2) {
				[userIndex, opponentIndex] = [opponentIndex, userIndex];
				paddlePos[0] -= roomInfo?.paddleSize, paddlePos[1] -= roomInfo?.paddleSize;
			}
			scores = roomInfo?.scores;
		});

		$client.socket.on("PlayerUpdate", (data: any) => {
			console.log("PlayerUpdate", data);
			if (data.join) {
				roomInfo.players.push(data.userInfo);
				roomInfo = roomInfo;
			} else {
				let userIndex = (roomInfo.players[0].username_42 == user.username_42) ? 0 : 1;
				roomInfo.players = roomInfo.players.splice(userIndex, 1);
				if (roomInfo.roomHost != data.hostname)
					roomInfo.roomHost = data.hostname;
			}
		})
		
		$client.socket.on("PaddleUpdate", (data: any) => {
			if ((data.player == UserType.Player1 && userIndex == UserType.Player2) ||
				(data.player == UserType.Player2 && userIndex == UserType.Player2))
				paddlePos[data.player] = data.paddlePos;
			else
				paddlePos[data.player] = roomInfo?.mapSize[0] - data.paddlePos;
		});

		$client.socket.on("LoadBall", (data: any) => {
			console.log("LoadBall");
			puck = new Puck(roomInfo?.mapSize[0], roomInfo?.mapSize[1], data.vectorX, data.vectorY);
		});

		$client.socket.on("PongStart", () => {
			console.log("PongStart");
			if (!puck)
				console.log("Pongstart Error!");

			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 20);
		});

		$client.socket.on("DeathPointUpdate", (data: any) => {
			console.log("DeathPointUpdate");
			deathPoint = data;
		});

		$client.socket.on("PuckHit", (data: any) => {
			console.log("PuckHit");
			puck.vectorY *= -1;
		});

		$client.socket.on("ScoreUpdate", (data: any) => {
			console.log("ScoreUpdate", data);

			clearInterval(puckMoving);
			scores[data.scoreTo]++;
			scores = scores;

			puck = undefined;
		});

		$client.socket.on("ReadyUpdate", (data: any) => {
			console.log("ReadyUpdate??", ready);

			ready = data.ready;
		});

		$client.socket.on("GameFinished", (data: any) => {
			console.log("GameFinished");
			winner = roomInfo.players[data.winner];
			puck = undefined;
			gameFinishedModal.open();
		});

		$client.socket.on("GameStartFail", () => { tryStart = false; });
		$client.socket.on("GameStart", () => { gameStart = true });
	});

</script>

{#if !miniMode}
{#if roomFound}
<div class="container">
	{#if roomInfo}
	<div class="flex pong" style="width: {roomInfo.mapSize[1] + 200}px; height: {roomInfo.mapSize[0]}px;">
		<div class="vflex side">
			<Player userInfo={(roomInfo.players.length > 1) ? roomInfo.players[opponentIndex] : undefined} left={true} host={(roomInfo.players[opponentIndex]?.username_42 == roomInfo.roomHost) ? true : false} ready={ready}/>	
			<h1>{scores[opponentIndex]}</h1>
		</div>
		<div class="pong-game" style="min-width: {roomInfo.mapSize[1]}px; min-height: {roomInfo.mapSize[0]}px;">
			<Paddle pos={paddlePos[opponentIndex]} paddleWidth={roomInfo.paddleSize}
				gameHeight={roomInfo.mapSize[1]} user={false}
				userIndex={userIndex} userPresent={(roomInfo.players.length > 1) ? true : false}/>
			{#if puck}
			<PongPuck posX={(userIndex == UserType.Player1) ? roomInfo.mapSize[0] - puck.posX : puck.posX}
				posY={(userIndex == UserType.Player1) ? roomInfo.mapSize[1] - puck.posY : puck.posY} />
			{/if}
			<Paddle pos={paddlePos[userIndex]} paddleWidth={roomInfo.paddleSize}
				gameHeight={roomInfo.mapSize[1]}
				user={true} userIndex={userIndex} userPresent={true}/>
		</div>
		<div class="vflex side right">
			<Player userInfo={roomInfo.players[userIndex]} left={false} host={(roomInfo.players[userIndex]?.username_42 == roomInfo.roomHost) ? true : false} ready={ready}/>
			<h1>{scores[userIndex]}</h1>
		</div>
	</div>
	{/if}
	<div class="button-container">
		<!-- there should be a difference between host-guest mode and random matching mode -->
		{#if !gameStart}
		{#if $user.username == roomInfo.roomHost}
		{#if !tryStart}
		<button class="start" on:click={()=>{
			if (!ready) {
				// TODO message appear
				return ;
			}
			tryStart = true;
			$client.socket.emit("StartGame", { roomId: roomId })
		}}>START</button>
		{:else}
		<button class="start loading"></button>
		{/if}
		{/if}
		{#if userType == UserType.Player2}
		<button class="ready" on:click={()=>{
			$client.socket.emit("isReady", {
				roomId: roomId,
				ready: !ready,
			});
		}}>{(!ready) ? "READY" : "CANCEL"}</button>
		{/if}
		{/if}
		<button class="exit" on:click={()=>{ quitConfirmMsgModal.open(); }}>EXIT</button>
	</div>
	<div class="mini-mode" on:click={()=>{ miniMode = true; }}>_</div>
</div>
{:else}
<div class="loading-box">
	<h1 class="msg">LOADING...</h1>
</div>
{/if}
{:else}
what is this?
{/if}

<Modal bind:this={gameFinishedModal} closeOnBgClick={true}>
	<GameOver winner={winner} gameModal={itself} itself={gameFinishedModal} scores={scores}/>
</Modal>

<Modal bind:this={quitConfirmMsgModal} closeOnBgClick={false}>
	<ConfirmMsg msg={"Are you sure you want to quit?"} toQuit={itself} roomId={roomId} itself={quitConfirmMsgModal}/>
</Modal>

<svelte:window

on:keypress={(event) => {
	if (userType == UserType.Watcher
	|| (event.code != 'KeyA' && event.code != 'KeyD'))
		return ;

	if (moving) //* TODO should make movement more fluent
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