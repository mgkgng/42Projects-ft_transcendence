<style lang="scss">
	.profile {
		width: 550px;
		height: 650px;
		padding: 1.8em 1.5em;
		gap: 0;

		.info {
			position: relative;

			width: 100%;
			max-height: 400px;
			border-radius: .4em;
			border: $border-thin;
		
			padding: 1em;
	
			color: #e6e6e6;
	
			.photo {
				img {
					width: 120px;
					height: 150px;
					object-fit: cover;
					border-radius: .4em;
				}
			}

			.data {
				gap: .5em;
				
				p {
					width: 100%;
				}
	
				.username {
					font-size: 20px;
					border-radius: .2em;
					cursor: pointer;
					transition: .2s;

					&:hover { background-color: transparentize(#fff, .6); }
				}

			}
		}
		.tools {
			width: 100%;
			align-items: center;
			justify-content: center;
			gap: 2em;
			
			button {
				width: 5em;
				height: 2em;
				aspect-ratio: 1 / 1;
				border: $border-thin;
				border-top: none;

				border-radius: 0 0 .3em .3em;
				cursor: pointer;
				transition: .1s;
	
				&:nth-child(1):hover { background-color: $main-bright;}
				&:nth-child(2):hover { background-color: $red;}
				&:nth-child(3):hover { background-color: $submain-lowshadeblue;}
			}
		}

		.history {
			width: 100%;
			min-height: 60%;
			border-radius: .3em;
			margin-top: 1em;
	
			text-align: center;
	
			border: $border-thin;
			padding: 1.2em;
	
			color: #e6e6e6;
			font-size: 18px;
	
			overflow-y: scroll;

			.line {
				img {
					width: 32px;
					height: 32px;
					object-fit: cover;
				}
			}
		}
	}
</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "$lib/stores/client";
    import CloseButton from "$lib/items/CloseButton.svelte";
    import WriteMessage from "$lib/users/WriteMessage.svelte";
    import Modal from "../tools/Modal.svelte";

	export let itself: any;
	export let profileUser: any;

	console.log(profileUser);

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	let writeMessageModal: any;

	let gameHistory: Array<any> = [];
	let update : boolean = false;
	$: {
		if (profileUser.username_42 != undefined && !update)
		{
			lunch_update();
			update = true;
		}
	} 	

	function lunch_update() {
		console.log("test:", profileUser);
		$client.socket.emit("getHistory", { username: profileUser.username_42 });
		$client.socket.emit("isUserBlocked", { username: profileUser.username_42 });
	}

	onMount(() => {
		$client.socket.on("error_askFriendG", (data: any) => {
			console.log("error", data)
		});
		$client.socket.on("success_askFriendG", (data: any) => {
			profileUser.is_asked = true;
			profileUser = profileUser;
		});

		$client.socket.on("success_unAskFriendG", (data: any) => {
			profileUser.is_asked = false;
			profileUser = profileUser;
		});

		$client.socket.on("success_isUserBlocked", (data: any) => {
			profileUser.is_blocked = data.isUserBlocked;
			profileUser = profileUser;
		});

		$client.socket.on("resHistory", (data: any) => {
			gameHistory = data;
		});
		$client.socket.on("error_resHistory", (data: any) => {
			//Username not exist in db
		});
		return (() => {
			$client.socket.off("resHistory");
			$client.socket.off("error_askFriendG");
			$client.socket.off("success_askFriendG");
			$client.socket.off("success_unAskFriendG");
			$client.socket.off("success_isUserBlocked");
			$client.socket.off("success_unblockUser");
			$client.socket.off("success_blockUser");
		});
	});

	function toggleBlock() {
		if (profileUser.is_blocked) {
			$client.socket.emit("unblockUser", { username: profileUser.username });
			profileUser.is_blocked = false;
		} else {
			$client.socket.emit("blockUser", { username: profileUser.username });
			profileUser.is_blocked = true;
		}
		profileUser = profileUser;
	}
</script>

<Modal bind:this={writeMessageModal}>
	<WriteMessage itself={writeMessageModal} sendTo={[profileUser.username]}/>
</Modal>


<div class="vflex window profile">
{#if profileUser != null && profileUser.created_at != null}
	<div class="flex info">
		<div class="photo">
			<img src={profileUser.img_url} alt="grosse-tete">
		</div>
		<div class="vflex data">
			<p class="username">{profileUser.displayname} a.k.a. {profileUser.username}</p>
			<p class="campus">Campus: {profileUser.campus_name}, {profileUser.campus_country}</p>
			<p>Joined: {profileUser.created_at.split('T')[0]}</p>
			<p>Connected: {(profileUser.status == "online") ? "Online" : profileUser.last_connection.split('T'[0])}</p>
		</div>
	</div>
	{#if profileUser.username_42 != userInfo.username_42}
	<div class="flex tools">
		{#if !profileUser.is_friend && !profileUser.is_asked}
		<button on:click={() => {
			$client.socket.emit("askFriendG", { username: profileUser.username });
		}}>Add</button>
		{:else if !profileUser.is_friend && profileUser.is_asked}
		<button on:click={() => {
			$client.socket.emit("unAskFriendG", { username: profileUser.username });
		}}>Cancel</button>
		{/if}
		{#if !profileUser.is_blocked}
			<button on:click={toggleBlock}>Block</button>
		{:else}
			<button on:click={toggleBlock}>Unblock</button>
		{/if}
		<button on:click={() => { writeMessageModal.open(); }}>Message</button>
	</div>
	{/if} 
	<div class="history">
		{#if gameHistory.length}
		{#each gameHistory as game}
		<div class="flex line">
			<div class="vflex result">
				<div>{game.player1.username} vs {game.player2.username}</div>
				<div>{game.player1_score} : {game.player2_score}</div>
			</div>
			<div>{game.date_game.split("T")[0]}</div>
		</div>
		{/each}
		{:else}
			<p>No Game History Yet</p>
		{/if}
	</div>
{/if}
	<CloseButton window={itself}/>
</div>