<style lang="scss">
	.add {
		position: relative;
		width: 450px;
		height: 130px;
		border: $border;
		background-color: #313131;
		border-radius: .2em;
		align-items: center;
		gap: .5em;
		padding: 1.2em;
		padding-bottom: 0;

	
		.info {
			align-items: center;
			gap: 0.3em;
			width: 100%;

			p {
				padding-left: .3em;
				font-size: 14px;
			}
	
			.text-input {
				border-radius: .2em;
				padding-left: .5em;
	
				width: 50%;
				height: 1.8em;
	
				background-color: #fff;
				color: #000;
			}
	
			.empty {
				border-radius: .2em;
	
				width: 50%;
				height: 1.8em;
				background-color: #000;
			}
		}

		.private {
			position: relative;
			flex-direction: row-reverse;
			width: 100%;
			height: 3em;
			gap: .2em;
			align-items: center;
 
			label {
				width: 20%;
				height: 75%;
				font-size: 18px;
				cursor: pointer;

				text-align: cetner;
			
				.wrapper {
					position: absolute;
					width: 20%;
					height: 75%;
					padding: .5em;
					padding-top: .2em;
					border: $border;
					border-radius: .2em;
				}

				input { display: none;	}
				input:checked + .wrapper { background-color: $submain-blue; }
			}
		}

		button {
			position: absolute;
			left: 40%;
			bottom: .5em;
			width: 4em;
			height: 2em;
			font-size: 25px;
			cursor: pointer;
			transition: .3s;
			border: $border;
			border-radius: .2em;
			
			&:hover {
				background-color: $submain-blue;
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";

	export let itself: any;

	let newRoomName: string;
	let newRoomPassword: string = "";
	let withPassword: boolean = false;
	let isPrivate: boolean = false;

	function createRoom() {
		$client.socket.emit("new_room", {room_name: newRoomName, is_password_protected: is_new_room_password_protected, room_password: newRoomPassword, is_private: false});
		itself.close();
	}
</script>

<div class="vflex window add">
	<div class="flex info">
		<input class="text-input" placeholder="Room Name" bind:value={newRoomName}>
		{#if (withPassword)}
		<input class="text-input" placeholder="Password" bind:value={newRoomPassword}>
		{:else}
		<div class="empty"></div>
		{/if}
		<p>Password</p>
		<input class="checkbox" type="checkbox" bind:checked={withPassword}>
	</div>
	<div class="flex private">
		<label class="form">
			<input type="checkbox" bind:checked={isPrivate} />
			<div class="wrapper">private</div>
		</label>
	</div>
		
	<button on:click={() => createRoom}>ADD</button>

</div>
