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
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from "$lib/stores/client";
	import { UserType, MapSize, PaddleSize } from '$lib/stores/var';
	import Paddle from '$lib/game/Paddle.svelte';
	import { Puck } from '$lib/pong/Puck';
    import PPuck from '$lib/game/PPuck.svelte';
    import Modal from '$lib/tools/Modal.svelte';
    import GameOver from '$lib/game/GameOver.svelte';
    import ConfirmMsg from '$lib/modals/ConfirmMsg.svelte';
    import { user } from '$lib/stores/user';
    import Player from '$lib/game/Player.svelte';


	export let roomID: string;
	export let itself: any;	

	let puck: any = undefined;

	let userType: number;
	let initPos: number;

	let quitConfirmMsgModal: any;

	let moving = false;
	let puckMoving: any;
	
	let gameFinishedModal: any;

	let ready: boolean = false;
	let tryStart: boolean = false;
	let gameStart: boolean = false;

	let winner: any;

	/* Room Info */
	let gameInfo: any;
	let hostname: string;
	let player1: any;
	let player2: any;

	let switchPlace: boolean = false;
	
	onMount(()=> {
		if (!roomID.length)
			return ;
		
		$client.socket.on("RoomFound", (data: any) => {
			console.log("RoomFound", data);

			// Get room information
			gameInfo = data.gameInfo;
			hostname = data.hostname;
			player1 = data.player1;
			player2 = data.player2;
			initPos = (MapSize[gameInfo?.mapSize][0] - PaddleSize[gameInfo?.paddleSize]) / 2;
			userType = (player1?.info.username_42 == $user.username) ? UserType.Player1 :
				(player2?.info.username_42 == $user.username) ? UserType.Player2 :
				UserType.Watcher;

			// By default, player1 is on the right side unless user is the player2
			switchPlace = ($user.username_42 == player2?.info.username_42);
		});

		$client.socket.on("PlayerUpdate", (data: any) => {
			console.log("PlayerUpdate", data);
			if (data.join) {
				player2 = data;
			} else {
				if (data.username == player1.info.username_42)
					player1 = undefined;
				else
					player2 = undefined;
				hostname = data.hostname;
			}
		});
		
		$client.socket.on("PaddleUpdate", (data: any) => {
			if (data.player == player1.info.username && !switchPlace)
				player1.pos = data.pos;
			else
				player2.pos = gameInfo.mapSize[0] - data.pos;
		});

		$client.socket.on("LoadBall", (data: any) => {
			console.log("LoadBall", data);
			puck = new Puck(data.vec, data.pos, MapSize[gameInfo.mapSize]);
		});

		$client.socket.on("PongStart", () => {
			console.log("PongStart");
			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 20);
		});

		$client.socket.on("PuckHit", (data: any) => {
			console.log("PuckHit");
			puck.vectorY *= -1;
		});

		$client.socket.on("ScoreUpdate", (data: any) => {
			console.log("ScoreUpdate", data);

			// Destroy puck
			clearInterval(puckMoving);
			puck = undefined;

			// Update Score
			if (player1.info.username == data)
				player1.score++;
			else
				player2.score++;
		});

		$client.socket.on("ReadyUpdate", (data: any) => {
			ready = data;
		});

		$client.socket.on("GameFinished", (data: any) => {
			puck = undefined;
			winner = data;
			gameFinishedModal.open();
		});

		$client.socket.on("GameStartFail", () => { tryStart = false; });
		$client.socket.on("GameStart", () => { gameStart = true });

		$client.socket.emit("RoomCheck", {
			client: $client.id,
			room: roomID
		});

		return (() => {
			if (puckMoving)
				clearInterval(puckMoving);
			$client.removeListeners("RoomInfo", "PlayerUpdate", "PaddleUpdate",
				"LoadBall", "PongStart", "PuckHit", "ScoreUpdate",
				"ReadyUpdate", "GameFinished", "GameStartFail", "GameStart");
		});
	});

</script>

{#if gameInfo}
<div class="container">
	<div class="flex pong" style="width: {MapSize[gameInfo.mapSize][1] + 200}px; height: {MapSize[gameInfo.mapSize][0]}px;">
		<div class="vflex side">
			<Player player={(!switchPlace) ? player2 : player1} left={true} host={(hostname == ((!switchPlace) ? player2?.info.username : player1?.info.username))} ready={ready}/>	
			<h1>{(!switchPlace) ? player1.score : player2.score}</h1>
		</div>
		<div class="pong-game" style="min-width: {MapSize[gameInfo.mapSize][1]}px; min-height: {MapSize[gameInfo.mapSize][0]}px;">
			<Paddle pos={(switchPlace) ? player1?.pos : player2?.pos} paddleWidth={PaddleSize[gameInfo.paddleSize]}
				gameHeight={MapSize[gameInfo.mapSize][1]}
				switchPlace={switchPlace}
				playerType={(!switchPlace) ? 2 : 1}
				user={(!switchPlace) ? player2 : player1}
				initPos={initPos}/>
			{#if puck}
			<PPuck pos={[(!switchPlace) ? MapSize[gameInfo.mapSize][0] - puck.pos[0] : puck.pos[0],
				(!switchPlace) ? MapSize[gameInfo.mapSize][1] - puck.pos[1] : puck.pos[1]]} />
			{/if}
			<Paddle pos={(switchPlace) ? player2?.pos : player1?.pos} paddleWidth={PaddleSize[gameInfo.paddleSize]}
				gameHeight={MapSize[gameInfo.mapSize][1]}
				switchPlace={switchPlace}
				playerType={(!switchPlace) ? 1 : 2}
				user={(switchPlace) ? player2 : player1}
				initPos={initPos}/>;
		</div>
		<div class="vflex side right">
			<Player player={(!switchPlace) ? player1 : player2} left={false} host={(hostname == ((!switchPlace) ? player1?.info.username : player2?.info.username))} ready={ready}/>
			<h1>{(!switchPlace) ? player1.score : player2.score}</h1>
		</div>
	</div>
	<div class="button-container">
		<!-- there should be a difference between host-guest mode and random matching mode -->
		{#if !gameStart}
		{#if $user.username == hostname}
		{#if !tryStart}
		<button class="start" on:click={()=>{
			if (!ready) {
				// TODO message appear
				return ;
			}
			tryStart = true;
			$client.socket.emit("StartGame", roomID)
		}}>START</button>
		{:else}
		<button class="start loading"></button>
		{/if}
		{/if}
		{#if userType == UserType.Player2}
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

<Modal bind:this={gameFinishedModal} closeOnBgClick={true}>
	<GameOver winner={winner} gameModal={itself} itself={gameFinishedModal} scores={[player1.score, player2.score]}/>
</Modal>

<Modal bind:this={quitConfirmMsgModal} closeOnBgClick={false}>
	<ConfirmMsg msg={"Are you sure you want to quit?"} toQuit={itself} roomID={roomID} itself={quitConfirmMsgModal}/>
</Modal>

<svelte:window
	on:keypress={(event) => {
		if ((userType == UserType.Watcher)
		|| (event.code != 'KeyA' && event.code != 'KeyD'))
			return ;

		if (moving) //* TODO should make movement more fluent
			return ;

		moving = true;

		$client.socket.emit("PaddleMove", {
			room: roomID,
			left: ((userType == UserType.Player1 && !switchPlace) && event.code == 'KeyD'
				|| userType == UserType.Player2 && event.code == 'KeyA')
		});
	}}

	on:keyup={(event)=>{
		if (event.code != 'KeyA' && event.code != 'KeyD')
			return ;
		
		//* TODO some precision to make
		$client.socket.emit("PaddleStop", roomID);

		moving = false;
	}}
/>