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
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from "$lib/stores/client";
	import { UserType, MapSize, PaddleSize } from '$lib/stores/var';
	import { Puck } from '$lib/pong/Puck';
    import Modal from '$lib/tools/Modal.svelte';
    import GameOver from '$lib/game/GameOver.svelte';
    import ConfirmMsg from '$lib/modals/ConfirmMsg.svelte';
    import { user } from '$lib/stores/user';
    import Player from '$lib/game/Player.svelte';
	import Game from '$lib/game/Game.svelte';
	import AlertMessage from '$lib/modals/AlertMessage.svelte';

	export let roomID: string;
	export let itself: any;	

	let puck: any = undefined;

	let userType: number;
	let initPos: number;

	let quitConfirmMsgModal: any;

	let puckMoving: any;
	
	let gameFinishedModal: any;
	let alertMessageModal: any;
	let alertMessage: string;

	let ready: boolean = false;
	let tryStart: boolean = false;
	let started: boolean = false;

	let winner: any;

	/* Room Info */
	let gameInfo: any;
	let hostname: string;
	let player1: any = undefined;
	let player2: any = undefined;

	let switched: boolean = false;

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	$: console.log("this is the roomID", roomID);

	onMount(()=> {
		if (!roomID)
			return ;
		
		$client.socket.on("RoomFound", (data: any) => {
			console.log("RoomFound", data);

			// Get room information
			gameInfo = data.gameInfo;
			hostname = data.hostname;
			if (!hostname.length)
				started = true;
			player1 = data.player1;
			player2 = data.player2;
			userType = (player1?.info.username_42 == userInfo.username) ? UserType.Player1 :
				(player2?.info.username_42 == userInfo.username) ? UserType.Player2 :
				UserType.Watcher;

			// By default, player1 is on the right side unless user is the player2
			switched = (userInfo.username == player2?.info.username_42);
		});

		$client.socket.on("PlayerUpdate", (data: any) => {
			console.log("PlayerUpdate", data);
			if (data.join) {
				player2 = data.player;
			} else {
				if (started) {
					if (puckMoving)
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
			if (data.type == 0)
				player1.pos = data.pos;
			else
				player2.pos = data.pos;
		});

		$client.socket.on("LoadBall", (data: any) => { puck = new Puck(data.vec, data.pos, MapSize[gameInfo.mapSize]); });

		$client.socket.on("PongStart", () => {
			console.log("PongStart");
			puckMoving = setInterval(() => {
				puck.move();
				puck = puck;
			}, 20);
		});

		$client.socket.on("PuckHit", (data: any) => {
			puck.vec[1] += (puck.vec[1] > 0) ? 1 : -1;
			puck.vec[1] *= -1;
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
			<Player player={(!switched) ? player2 : player1} left={true} hostname={hostname} ready={ready}/>	
			<h1>{(!switched && player2) ? player2.score : ((!switched && !player2) || (switched && !player1)) ? "0" : player1?.score}</h1>
		</div>
		<Game bind:player1={player1} bind:player2={player2} bind:gameInfo={gameInfo} bind:switched={switched}
			userType={userType} roomID={roomID} puck={puck}/>
		<div class="vflex side right">
			<Player player={(!switched) ? player1 : player2} left={false} hostname={hostname} ready={ready}/>
			<h1>{(!switched && player1) ? player1?.score : (player2) ? player2.score : "0"}</h1>
		</div>
	</div>
	<div class="button-container">
		<!-- there should be a difference between host-guest mode and random matching mode -->
		{#if !started && hostname.length}
			{#if userInfo.username == hostname}
			<button class="start" on:click={()=>{
				if (!ready) {
					alertMessage = "The guest is not ready yet";
					alertMessageModal.open();
					return ;
				}
				tryStart = true;
				$client.socket.emit("StartGame", roomID)
			}}>START</button>
			{:else}
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
	<GameOver winner={(winner == player1.username) ? player1 : player2} gameModal={itself} itself={gameFinishedModal} scores={[player1?.score, player2?.score]}/>
</Modal>

<Modal bind:this={quitConfirmMsgModal} closeOnBgClick={false}>
	<ConfirmMsg msg={"Are you sure you want to quit?"} toQuit={itself} roomID={roomID} itself={quitConfirmMsgModal}/>
</Modal>

<Modal bind:this={alertMessageModal}>
	<AlertMessage msg={alertMessage} itself={alertMessageModal} />
</Modal>