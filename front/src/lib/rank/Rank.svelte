<style lang="scss">
	.rank {
		width: 640px;
		height: 800px;

		padding: 1.5em 2em;

		align-items: center;

		.list {
			width: 100%;
			height: 90%;
			padding: 1em 2em;
			text-align: center;
			gap: 0;

			border: $border;
			border-radius: .4em;

			overflow-y: scroll;

			.line {
				padding: .5em 0;
				width: 100%;
				gap: 0;
				display: grid;
				grid-template-columns: 10% 30% 20% 13% 13% 13%;
				border-bottom: $border-thin;
				align-items: center;
				.user {
					cursor: pointer;
					transition: .2s;
				}

				h3 {
					height: 100%;
					border-radius: .3em;
				}
				&:nth-child(2) { h3 {
					background-color: #cde309f4; }
				}
				&:nth-child(3) { h3 {
					background-color: transparentize(#fff, .6); }
				}
				&:nth-child(4) { h3 {
					background-color: #986911; }
				}
			}
			.no-match {
				width: 100%;
				height: 50%;
				align-items: center;
				justify-content: center;
				font-size: 25px;
			}
		}
	}
</style>

<script lang="ts">
	import { onMount } from "svelte";
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
    import CloseButton from "$lib/items/CloseButton.svelte";
    import Modal from "$lib/tools/Modal.svelte";
    import UserProfile from "$lib/users/UserProfile.svelte";

	export let itself: any;

	let userInfo: any;
	user.subscribe((user: any) => { userInfo = user; });

	
	let userProfileModal: any;
	let profileUser: any;
	let myPos: number = -1;

	let rankList: Array<any> = [];

	onMount(() => {
		$client.socket.emit("RankingReq");

		$client.socket.on("RankingRes", (data: any) => {
			rankList = data;
			myPos = data.map((x: any) => x.username).indexOf(userInfo.username);
		});

		return (() => {
			$client.socket.off("RankingRes");
		});
	});
</script>

<Modal bind:this={userProfileModal}>
	<UserProfile itself={userProfileModal} profileUser={profileUser}/>
</Modal>

<div class="vflex window rank">
	<h1>Global Ranking</h1>
	<h3>{(myPos != -1) ? "You are situated at #" + (myPos + 1) + " !": "Try any game to find yourself in the rank!"}</h3>
	<div class="vflex list">
		<div class="flex line">
			<p>Rank</p>
			<p>Player</p>
			<p>Campus</p>
			<p>Wins</p>
			<p>Games</p>
			<p>Rate</p>
		</div>
		{#if rankList.length}
			{#each rankList as rank, i}
			<div class="flex line">
				<h3>#{i + 1}</h3>
				<p class="user" on:click={() => {
					profileUser = rank;
					// check if the user is the current user
					if (profileUser.username == userInfo.username) {
						profileUser.username_42 = profileUser.username_42 = JSON.parse(atob(localStorage.getItem("transcendence-jwt").split(".")[1])).username_42;
						userProfileModal.open();
					}
					userProfileModal.open();
				}}>{rank.username}</p>
				<p>{rank.campus_name}, {rank.campus_country}</p>
				<p>{rank.nb_victory}</p>
				<p>{rank.nb_game}</p>
				<p>{rank.win_rate.toFixed(2)}%</p>
			</div>
			{/each}
		{:else}
		<div class="flex no-match">
			<p>No match has been made</p>
		</div>
		{/if}
	</div>
	<CloseButton window={itself} />
</div>