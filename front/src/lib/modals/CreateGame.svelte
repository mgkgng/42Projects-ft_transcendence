<style lang="scss">
	.container {
		position: relative;
		width: 420px;
		height: 400px;
		font-size: 19px;

		padding-left: 3em;
		padding-top: 1.5em;
		padding-bottom: 4em;
		padding-right: 0;
		background-color: transparentize(#313131, 0.25);

		color: #fff;
		border: 2px solid transparentize(#fff, .6);
		border-radius: .5em;

		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
	}

	.box {
		display: flex;
		flex-direction: column;
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

	
			&:hover {
				background-color: transparentize($submain-lowshadeblue, 0.4);
			}
		}
	}

	.submit {
		position: absolute;
		left: 30%;
		bottom: 1.2em;
		padding: 1em;
		border-radius: .5em;
		border: 2px solid transparentize(#fff, .6);
		background-color: #313131;
		color: #fff;
		cursor: pointer;

		&:hover {
			background-color: $submain-lowshadeblue;
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
	let difficulty: number = 3;
	let mapSize: number = 2;
	let privateMode: boolean = false;
	let roomTitle: string = "Hello World!";

</script>

<div class="container">
	<div class="button-box">
		<button class="button-back" on:click={()=>{
			itself.close();
			enterGameModal.open();
		}}>&lt</button>
	</div>
	<div class="box">
		<div class="option">
			<p>Title</p>
			<label>				
				<input bind:value={roomTitle}>
			</label>
		</div>
		<div class="option">
			<p>Size</p>
			<label>
				<input type=radio bind:group={mapSize} name="mapSize" value={1}>Small
				<input type=radio bind:group={mapSize} name="mapSize" value={2}>Medium
				<input type=radio bind:group={mapSize} name="mapSize" value={3}>Large
			</label>
		</div>
		<div class="option">
			<p>Points</p>
			<label>
				<input type=number bind:value={maxPoint} min=3 max=20>
				<input type=range bind:value={maxPoint} min=3 max=20>
			</label>
		</div>
		<div class="option">
			<p>Difficulty</p>
			<label>
				<input type=radio bind:group={difficulty} name="mapSize" value={1}>Easy
				<input type=radio bind:group={difficulty} name="mapSize" value={2}>Normal
				<input type=radio bind:group={difficulty} name="mapSize" value={3}>Hard
			</label>
		</div>
		<div class="option">
			<p>Mode</p>
			<label>
				<input type=radio bind:group={privateMode} name="privateMode" value={false}> Public
				<input type=radio bind:group={privateMode} name="privateMode" value={true}> Private
			</label>
		</div>
	</div>
	<button class="submit" on:click={()=>{
		$client.socket.emit("CreateRoom", {
			username: $user.username,
			title: roomTitle,
			mapSize: mapSize,
			maxPoint: maxPoint,
			difficulty: difficulty,
			privateMode: privateMode
		});
		itself.close();
	}}>Create Game</button>
	
</div>