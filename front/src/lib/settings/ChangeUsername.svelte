<style lang="scss">
	.modify {
		width: 18em;
		height: 9em;
		padding: 1em;
		padding-left: 1.5em;
		padding-top: 2.5em;

		.message {
			position: absolute;
			top: .6em;
			left: 20%;
			color: $red;
			// make font bold
		}
		.input {
			width: 100%;
			height: 40%;
			gap: .5em;
		
			input {
				width: 13.3em;
				background-color: #fff;
				padding-left: .5em;
				border-radius: .2em;
				color: #000;
			}
			
		}
		.buttons {
			position: absolute;
			left: 4em;
			bottom: 1em;
			gap: .2em;
	
			button {
				border: $border-thin;
				border-radius: .3em;
				width: 5em;
				height: 2.5em;
				background-color: $green;

				&:first-child { background-color: $red; }
			}
		}
	}
</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "../stores/client";

	export let itself: any;

	export let username: string;
	let now: string = username;
	let modified: boolean = false;
	let confirmed: boolean = false;
	$: modified = !(username == now);
	$: checkNewUsername(now);

	let message: string = "";
	let err: boolean = false;

	function checkNewUsername(now: string) {
		console.log("???");
		if (!modified) {
			message = "";
			return ;
		} else if (now.length < 6 || now.length > 15) {
			message = "Your ID should have have between 6 and 15 characters.";
			err = true;
			return ;
		}
		$client.socket.emit("CheckNewUsername", now);
	}

	onMount(() => {
		$client.socket.on("CheckNewUsernameRes", (data: any) => {
			err = data.err;
			message = (data.msg) ? data.msg : "You can use this username!";
		});

			// $client.socket.on("change_username", (data) => {
			// confirmed = true;
			// 	chatRoom.update((value) => {
			// 		value.username_search = data.new_username;
			// 		return value;
			// 	}); 
			// });
		return (() => {
			$client.removeListeners("CheckNewUsernameRes", "change_username");
		});
	});
</script>

<div class="flex window modify">
	{#if message}
	<div class="message">
		{message}
	</div>
	{/if}
	<div class="flex input">
		<input type="text-input" placeholder="Put your new username here" bind:value={now}>
		<button style="display: {(modified) ? "block" : "none"}" on:click={() => {
			message = "";
			// $client.socket.emit("change_username", newUsername);
		}}>Try</button>
	</div>
	<div class="flex buttons">
		<button on:click={() => {
			itself.close();
		}}>Cancel</button>
		<button class="{(modified && confirmed) ? "" : "no-active"}" on:click={() => {
			username = now;
			itself.close();
		}}>Select</button>
	</div>
</div>