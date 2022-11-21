<style lang="scss">
	.container {
		position: relative;
		width: 520px;
		height: 480px;
		font-size: 19px;

		padding-left: 3em;
		padding-top: 1.5em;
		padding-bottom: 4em;
		padding-right: 0;
		background-color: transparentize(#313131, 0.25);

		color: #fff;
		border: 2px solid transparentize(#fff, .6);
		border-radius: .5em;

		justify-content: space-evenly;
	}

	.box {
		gap: 2em;
		width: 100%;

		align-items: center;
		justify-content: space-around;
	
		font-size: 15px;
		text-align: center;

		p {
			height: 100%;
			border-right: 1.2px solid;
		}
		.option {
			width: 90%;
			display: grid;
			grid-template-columns: 25% 75%;

			.text-input {
				padding-left: .5em;
				width: 95%;
				height: 1.8em;
				border-radius: .2em;
				background-color: #fff;
				color: #000;
			}

			.choice {
				gap: .2em;
				justify-content: center;
				align-items: center;
			}
			.choice input[type="radio"] {
				display: none;
			}

			.choice label {
				display: inline-block;
				border: $border-thin;
				border-radius: .2em;
				width: 5em;
				height: 1.8em;
				text-align: center;
				padding: .2em;
				font-size: 17px;
				cursor: pointer;
			}

			.choice input[type="radio"]:checked+label { background-color: $submain-blue; }

			label {
				padding: 0 1em; 
			}
		}
	}

	.button-box {
		position: absolute;
		top: 0;
		left: 0;
		width: 3em;
		height: 100%;

		padding-top: 8em;
		padding-bottom: 8em;
		padding-left: .8em;
		padding-right: .8em;
		
		button {
			width: 100%;
			height: 100%;
	
			transition: .3s;
			border-radius: .5em;
			border: none;
			background-color: transparentize(#fff, 1);
			font-size: 18px;
			cursor: pointer;

			&:hover { background-color: transparentize($main-bright, 0.4); }
		}
	}

	.submit {
		position: absolute;
		left: 35%;
		bottom: 1.2em;
		padding: 1em;
		border-radius: .5em;
		border: $border;
		background-color: $main-bright;
		color: #fff;
		cursor: pointer;
		transition: .2s;

		&:hover {
			filter: brightness(80%);
		}
	}
</style>

<script lang="ts">
	import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";

	export let itself: any;
	export let enterGameModal: any;

	let maxPoint: number = 10;
	let puckSpeed: number = 1;
	let mapSize: number = 1;
	let paddleSize: number = 1;
	let privateMode: boolean = false;
	let roomTitle: string = "";

	//TODO radio -> colored block
</script>

<div class="vflex container">
	<div class="button-box">
		<button class="button-back" on:click={()=>{
			itself.close();
			enterGameModal.open();
		}}>&lt</button>
	</div>
	<div class="vflex box">
		<div class="option">
			<p>Title</p>
			<label>
				<input class="text-input" placeholder="Room Title" bind:value={roomTitle}>
			</label>
		</div>
		<div class="option">
			<p>Size</p>
			<div class="flex choice">
				<input class="radio" id="size1" type=radio bind:group={mapSize} name="mapSize" value=0>
				<label for="size1">Small</label>
				<input class="radio" id="size2" type=radio bind:group={mapSize} name="mapSize" value=1>
				<label for="size2">Medium</label>
				<input class="radio" id="size3" type=radio bind:group={mapSize} name="mapSize" value=2>
				<label for="size3">Large</label>

			</div>
		</div>
		<div class="option">
			<p>Points</p>
			<label>
				<input type=number bind:value={maxPoint} min=3 max=20>
				<input type=range bind:value={maxPoint} min=3 max=20>
			</label>
		</div>
		<div class="option">
			<p>Paddle Size</p>
			<div class="flex choice">
				<input class="radio" id="paddle1" type=radio bind:group={paddleSize} name="paddleSize" value=0>
				<label for="paddle1">Short</label>
				<input class="radio" id="paddle2" type=radio bind:group={paddleSize} name="paddleSize" value=1>
				<label for="paddle2">Normal</label>
				<input class="radio" id="paddle3" type=radio bind:group={paddleSize} name="paddleSize" value=2>
				<label for="paddle3">Long</label>
			</div>
		</div>
		<div class="option">
			<p>Puck Speed</p>
			<div class="flex choice">
				<input type=radio id="speed1" bind:group={puckSpeed} name="puckSpeed" value=0>
				<label for="speed1">Slow</label>

				<input type=radio id="speed2" bind:group={puckSpeed} name="puckSpeed" value=1>
				<label for="speed2">Normal</label>

				<input type=radio id="speed3" bind:group={puckSpeed} name="puckSpeed" value=2>
				<label for="speed3">Fast</label>

			</div>
		</div>
		<div class="option">
			<p>Mode</p>
			<div class="flex choice">
				<input type=radio id="public" bind:group={privateMode} name="privateMode" value={false}> 
				<label for="public">Public</label>

				<input type=radio id="private" bind:group={privateMode} name="privateMode" value={true}> 
				<label for="private">Private</label>

			</div>
		</div>
	</div>
	<button class="submit" on:click={()=>{
		$client.socket.emit("CreateRoom", {
			title: (roomTitle.length) ? roomTitle : "Let's enjoy pong together!",
			mapSize: mapSize,
			maxPoint: maxPoint,
			puckSpeed: puckSpeed,
			paddleSize: paddleSize,
			privateMode: privateMode
		});
		itself.close();
	}}>Create Game</button>
	
</div>