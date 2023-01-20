<style lang="scss">
	.write {
		width: 640px;
		height: 480px;
		border: $border;
		border-radius: .3em;
		padding: 2em 2em;
		gap: 0;

		.tab {
			justify-content: center;
			align-items: center;
			gap: 0;
			border-radius: .2em;
			// margin-bottom: .5em;
			width: 100%;

			input { display: none; }

			label {
				border: $border-thin;
				border-bottom: 0;
				text-align: center;
				width: 40%;
				cursor: pointer;

				&:hover {
					background-color: transparentize(#fff, .8);
				}
				&:last-child {
					border-left: $border-thin;
				}
			}
			input:checked + label { background-color: transparentize($submain-lowshadeblue, 0); }
		}

		.search {
			position: relative;

			.bar {
				width: 85%;
				height: 2em;
				background-color: transparentize(#fff, .8);
				padding: .5em;
				border: $border-thin;
				border-radius: .2em;
	
				&:focus { background-color: transparentize(#fff, .5); }
			}
			.result {
				position: absolute;
				top: 2em;
				width: 85%;
				background-color: $grey;
				border-radius: .1em;
				z-index: 33;

				.user {
					padding: .5em .6em;
					gap: .4em;
					cursor: pointer;
					align-items: center;

				}
			}
			p {
				height: 2.5em;
				padding: .8em 1em;
			}
		}
		.send-to {
			width: 100%;
			border-radius: .3em;
			margin: .5em;
			.dist {
				.to {
					align-items: center;
					gap: .5em;
					padding: .2em .5em;
					background-color: $submain-lowshadeblue;
					border-radius: .3em;
				}
			}
		}
		.content {
			width: 100%;
			height: 75%;
			position: relative;
			border: $border-thin;
			border-radius: .3em;

			textarea {
				width: 100%;
				height: 100%;
				padding: 1em .6em;
			}
			button {
				position: absolute;
				padding: .5em .5em;
				right: .2em;
				bottom: .2em;
				border-radius: .3em;
				transition: .2s;

				&:hover {
					background-color: transparentize(#fff, .6);
				}
			}
		}
		.invite {
			gap: 0;
			width: 100%;
			height: 75%;
			border: $border-thin;
			border-radius: .3em;
			padding: .6em 2em;

			align-items: center;
			justify-content: space-around;
		
			font-size: 15px;
			text-align: center;

			.choice {
				p {
					height: 1.5em;
					border-bottom: 1.2px solid;
				}

				.option {
					width: 90%;
					gap: .2em;
	
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
						width: 3em;
						height: 1.8em;
						text-align: center;
						padding: .2em;
						font-size: 14px;
						cursor: pointer;
					}
	
					.choice input[type="radio"]:checked+label { background-color: $submain-lowshadeblue; }
	
					label {
						padding: 0 1em; 
					}
	
					input[type="range"] {
						width: 80%;
					}
					.number-input {
						align-items: center;
						gap: .3em;
						border: $border-thin;
						padding: .2em .5em;
					}
				}
			}
			.message {
				position: relative;
				width: 100%;
				height: 55%;
				border: $border-thin;
				textarea {
					width: 100%;
					height: 70%;
					resize: none;
					padding-top: .6em;
					padding-left: 1em;
					padding-right: 1em;
				}
				button {
					position: absolute;
					border-radius: .3em;
					right: 0.5em;
					bottom: 0.3em;
					transition: .2s;
					padding: .5em .8em;

					&:hover { background-color: transparentize(#fff, .6);}
				}
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    import Modal from "$lib/tools/Modal.svelte";
	import AlertMessage from "$lib/modals/AlertMessage.svelte";
    import { user } from "$lib/stores/user";

	export let itself: any;
	export let sendTo: Array<string>;

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	let message: string = "";
	let errorMessage: string = "";
	let alertMessageModal: any;

	let searchUser: string = "";
	let userSearchList: Array<any> = [];

	let directMessage: boolean = true;

	let maxPoint: number = 10;
	let puckSpeed: number = 1;
	let mapSize: number = 1;
	let paddleSize: number = 1;
		
	$: searchUser = "";
	$: searchUser = searchUser.toLowerCase();
	$: { $client.socket.emit("getUserinDB", {username: searchUser}); }
	
	$: console.log(sendTo);

	function createInvitationMessage(message: string) {
		return (`/gameInvitation/mapSize=${mapSize}&speed=${puckSpeed}&paddleSize=${paddleSize}&maxPoint=${maxPoint}&msg=${(message.length) ? message : "Let's play a game together!"}`);
	}

	onMount(() => {
		$client.socket.on("success_getUserinDB", (data: any) => {
			userSearchList = data.users.filter((user: any) => !sendTo.includes(user.username)); });
	
		$client.socket.on("success_sendDirectMessageG", (data: any) => {
			itself.close();
		});

		$client.socket.on("gameInvitationRes", (data: any) => {
			if (!data.success) {
				return ;
			}
		});

		return (() => {
			$client.socket.off("success_getUserinDB");
			$client.socket.off("success_sendDirectMessageG");
			$client.socket.off("gameInvitationRes");
		});
	});
</script>

<Modal bind:this={alertMessageModal}>
	<AlertMessage itself={alertMessageModal} msg={errorMessage} />
</Modal>

<div class="vflex window write">
	<div class="search">
		<input class="bar" type="text" placeholder="Search for users" bind:value={searchUser}>
		{#if searchUser.length}
			<div class="result">
				{#if userSearchList.length}
				{#each userSearchList as user}
				<div class="user" on:click={() => {
					if (sendTo.length < 5) {
						sendTo.push(user.username);
						sendTo = sendTo;
					} else {
						errorMessage = "You can write to maximum five people.";
						alertMessageModal.open();
					}
					searchUser = "";
				}}>
					{user.username}
				</div>
				{/each}
				{:else if searchUser.length && !userSearchList.length}
				<p>No result found</p>
				{/if}
			</div>
			{/if}
	</div>
	<div class="vflex send-to">
		<div class="flex dist">
			{#each sendTo as user}
			<div class="flex to">
				<p>{user}</p>
				<button on:click={() => {
					sendTo.splice(sendTo.indexOf(user), 1);
					sendTo = sendTo;
				}}>x</button>
			</div>
			{/each}
		</div>
	</div>
	<div class="flex tab">
		<input type=radio id="directMessage" bind:group={directMessage} name="directMessage" value={true}> 
		<label for="directMessage">Direct Message</label>
		<input type=radio id="gameInvitation" bind:group={directMessage} name="directMessage" value={false}> 
		<label for="gameInvitation">Game Invitation</label>
	</div>
	{#if directMessage === true}
	<div class="content">
		<textarea placeholder="Write your message here..." bind:value={message}></textarea>
		<button on:click={() => {
			if (!sendTo.length) {
				errorMessage = "Please put at least one destination."
				alertMessageModal.open();
				return ;
			} else if (!message.length) {
				errorMessage = "You cannot send an empty message!";
				alertMessageModal.open();
				return ;
			}
			for (let dest of sendTo)
				$client.socket.emit("sendDirectMessageG", {
					username: dest,
					message: message
				});
				message = "";
		}}>Send</button>
	</div>
	{:else}
	<div class="vflex invite">
		<div class="flex choice">
			<div class="vflex option">
				<p>Size</p>
				<div class="flex choice">
					<input class="radio" id="size1" type=radio bind:group={mapSize} name="mapSize" value={0}>
					<label for="size1">S</label>
					<input class="radio" id="size2" type=radio bind:group={mapSize} name="mapSize" value={1}>
					<label for="size2">M</label>
					<input class="radio" id="size3" type=radio bind:group={mapSize} name="mapSize" value={2}>
					<label for="size3">L</label>
				</div>
			</div>
			<div class="vflex option">
				<p>Paddle Size</p>
				<div class="flex choice">
					<input class="radio" id="paddle1" type=radio bind:group={paddleSize} name="paddleSize" value={0}>
					<label for="paddle1">S</label>
					<input class="radio" id="paddle2" type=radio bind:group={paddleSize} name="paddleSize" value={1}>
					<label for="paddle2">M</label>
					<input class="radio" id="paddle3" type=radio bind:group={paddleSize} name="paddleSize" value={2}>
					<label for="paddle3">L</label>
				</div>
			</div>
			<div class="vflex option">
				<p>Speed</p>
				<div class="flex choice">
					<input type=radio id="speed1" bind:group={puckSpeed} name="puckSpeed" value={0}>
					<label for="speed1">S</label>
					<input type=radio id="speed2" bind:group={puckSpeed} name="puckSpeed" value={1}>
					<label for="speed2">N</label>
					<input type=radio id="speed3" bind:group={puckSpeed} name="puckSpeed" value={2}>
					<label for="speed3">F</label>
				</div>
			</div>
			<div class="vflex option">
				<p>Points</p>
				<label class="number-input">
					<input type="number" bind:value={maxPoint} min=3 max=20>
				</label>
			</div>
		</div>
		<div class="message">
			<textarea placeholder="Write your invitation message here..." bind:value={message}></textarea>
			<button on:click={() => {
				if (!sendTo.length) {
					errorMessage = "Please put at least one destination."
					alertMessageModal.open();
					return ;
				} else if (sendTo.length > 1) {
					errorMessage = "You can invite only one person for a game.";
					alertMessageModal.open();
					return ;
				}
				if (sendTo[0] == userInfo.username) {
					errorMessage = "You cannot send a game invitation to yourself.";
					alertMessageModal.open();
					return ;
				}
				console.log(createInvitationMessage(message));
				$client.socket.emit("sendDirectMessageG", {
					username: sendTo[0],
					message: createInvitationMessage(message)
				});
				message = "";
			}}>Send</button>
		</div>
	</div>
	{/if}
</div>