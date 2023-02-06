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
			padding: 0.5em 1em;
	
			color: #e6e6e6;
			font-size: 18px;
	
			overflow-y: scroll;
			gap: .2em;

			h1 {
				font-size: 36px;
			}
			.line {
				img {
					width: 32px;
					height: 32px;
					object-fit: cover;
				}


				.result {
					display: grid;
					grid-template-columns: 50% 5% 10% 20%;
					
					.versus {
						display: grid;
						border: $border-thin;
						border-radius: .2em;
						grid-template-columns: 44% 12% 44%;
						
						.mid {
							border-left: $border-thin;
							border-right: $border-thin;
						}

						.uname {
							overflow: hidden;
							cursor: pointer;
							transition: .3s;
							&:hover { background-color: transparentize(#fff, .6)}
						}
					}

					.wl {
						width: 1.5em;
						height: 1.5em;
						border-radius: .2em;
						padding: .2em .3em;
					
					}

					.win { background-color: $green; }
					.lose {
						padding-top: .1em;
						background-color: $red;
					}


					.score {
						justify-content: center;
						align-items: center;
						gap: .3em;

						.mid { padding-bottom: .3em; }
					}

					.date {
						padding-top: .3em;
						font-size: 15px; 
					}
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
	import {format_date} from "$lib/stores/lib.ts"

	export let itself: any;
	export let profileUser: any;


	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	console.log(profileUser, userInfo);

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
		$client.socket.emit("getHistory", { username: profileUser.username });
		$client.socket.emit("isUserBlocked", { username_42: profileUser.username_42 });
	}

	onMount(() => {
		$client.socket.on("error_askFriendG", (data: any) => {
			console.log("error", data)
		});
		$client.socket.on("success_askFriendG", (data: any) => {
			profileUser.is_asked = true;
			profileUser.asked_by = data.asked_by;
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
			console.log(gameHistory);
		});

		$client.socket.on("error_resHistory", (data: any) => {
			//Username not exist in db
		});

		$client.socket.on("success_acceptFriend", (data: any) => {
			profileUser.is_friend = true;
			profileUser = profileUser;
		});

		return (() => {
			$client.socket.off("resHistory");
			$client.socket.off("error_askFriendG");
			$client.socket.off("success_askFriendG");
			$client.socket.off("success_unAskFriendG");
			$client.socket.off("success_acceptFriend");
			$client.socket.off("success_isUserBlocked");
			$client.socket.off("success_unblockUser");
			$client.socket.off("success_blockUser");
		});
	});

	function toggleBlock() {
		if (profileUser.is_blocked) {
			$client.socket.emit("unblockUser", { username_42: profileUser.username_42 });
			profileUser.is_blocked = false;
		} else {
			$client.socket.emit("blockUser", { username_42: profileUser.username_42 });
			profileUser.is_blocked = true;
		}
		profileUser = profileUser;
	}
</script>

<Modal bind:this={writeMessageModal}>
	<WriteMessage itself={writeMessageModal} sendTo={[profileUser.username_42]}/>
</Modal>


<div class="vflex window profile">
{#if profileUser != null && profileUser.created_at != null}
	<div class="flex info">
		<div class="photo">
			{#if profileUser.img_url.includes("cdn.intra.42.fr")}
				<img src='{profileUser.img_url}' alt="grosse-tete">
			{:else}
				<img src='http://{location.hostname}:3000{profileUser.img_url}' alt="grosse-tete">
			{/if}
		</div>
		<div class="vflex data">
			<p class="username">{profileUser.displayname} a.k.a. {profileUser.username}</p>
			<p class="campus">Campus: {profileUser.campus_name}, {profileUser.campus_country}</p>
			<p>Joined: {format_date(profileUser.created_at)}</p>
			<p>Connected: {(profileUser.status == "online") ? "Online" : format_date(profileUser.last_connection)}</p>
		</div>
	</div>
	{#if profileUser.username_42 != userInfo.username_42}
	<div class="flex tools">
		{#if !profileUser.is_friend && !profileUser.is_asked}
		<button on:click={() => {
			$client.socket.emit("askFriendG", { username_42: profileUser.username_42 });
		}}>Add</button>
		{:else if !profileUser.is_friend && profileUser.is_asked && profileUser.asked_by == userInfo.username_42}
		<button on:click={() => {
			$client.socket.emit("unAskFriendG", { username_42: profileUser.username_42 });
		}}>Cancel</button>
		{:else if !profileUser.is_friend && profileUser.is_asked && profileUser.asked_by != userInfo.username_42}
		<button on:click={() => {
			$client.socket.emit("acceptFriend", { username_42: profileUser.asked_by });
		}}>Accept</button>
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
		<div class="vflex line">
			<h1>- Match History -</h1>
			{#each gameHistory as game}
				<div class="flex result">
					<div class="versus">
						<div class="uname">{(game.player1_score > game.player2_score) ? game.player1.username : game.player2.username}</div>
						<div class="mid">vs</div>
						<div class="uname">{(game.player1_score > game.player2_score) ? game.player2.username : game.player1.username}</div>
					</div>
					<div class="wl {((game.player1_score > game.player2_score && game.player1.username == profileUser.username) || (game.player1_score < game.player2_score && game.player2.username == profileUser.username)) ? "win" : "lose"}">
						{((game.player1_score > game.player2_score && game.player1.username == profileUser.username) || (game.player1_score < game.player2_score && game.player2.username == profileUser.username)) ? "W" : "L"}
					</div>
					<div class="flex score">
						<div>{(game.player1_score > game.player2_score) ? game.player1_score : game.player2_score}</div>
						<div class="mid">:</div>
						<div>{(game.player1_score > game.player2_score) ? game.player2_score : game.player1_score}</div>
					</div>
					<div class="date">{game.date_game.split("T")[0]}</div>
				</div>
			{/each}
		</div>
		{:else}
			<p>No Game History Yet</p>
		{/if}
	</div>
{/if}
	<CloseButton window={itself}/>
</div>