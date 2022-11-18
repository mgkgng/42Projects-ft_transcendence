<style lang="scss">
	.profile {
		width: 550px;
		padding: 1.8em 1.5em;
		gap: .5em;

		.info {
			position: relative;

			width: 100%;
			max-height: 400px;
			border-radius: .4em;
			border: $border-thin;
	
			text-align: center;
	
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
			.tools {
				position: absolute;

				right: 0;
				bottom: .6em;
				padding: .3em;

				
				gap: .5em;

				border: $border-thin;
				border-right: none;
				border-radius: .2em 0 0 .2em;

				transition: .2s;
		
				button {
					width: 1.5em;
					aspect-ratio: 1 / 1;
					border-radius: 1em;
					border: 2px solid transparentize(#fff, .5);
					cursor: pointer;
					transition: .2s;
		
					&:hover {
						transform: scale(1.05);

					}

					&:nth-child(1):hover { background-color: $main-bright;}
					&:nth-child(2):hover { background-color: $submain-blue;}
					&:nth-child(3):hover { background-color: $green;}
				}

				&:hover {
					background-color: transparentize(#fff, 0.9);
				}
			}
		}

		.history {
			width: 100%;
			min-height: 200px;
			border-radius: .3em;
	
			text-align: center;
	
			border: $border-thin;
			padding: 1.2em;
	
			color: #e6e6e6;
			font-size: 36px;
	
			overflow-y: scroll;
		}
	}
</style>

<script lang="ts">
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "../stores/client";

	export let profileUser: any;
	$: console.log(profileUser);

	let gameHistory: Array<any> = [];

	onMount(() => {
		$client.socket.emit("getHistory", { username: profileUser.username });
		$client.socket.emit("resHistory", (data: any) => {
			gameHistory = data.history
		});
	});
</script>

<div class="vflex window profile">
	<div class="flex info">
		<div class="photo">
			<img src={profileUser.image_url} alt="grosse-tete">
		</div>
		<div class="vflex data">
			<p class="username">{profileUser.displayname} a.k.a. {profileUser.username}</p>
			<p class="campus">Campus: {profileUser.campus_name}, {profileUser.campus_country}</p>
		</div>

		{#if profileUser.username != $user.username}
		<div class="flex tools">
			<button>A</button>
			<button>B</button>
			<button>M</button>
		</div>
		{/if}
	</div>
	<div class="history">
		{#if gameHistory.length}
		<div class="line">

		</div>
		{:else}
		<p>No Game History Yet</p>
		{/if}
	</div>
</div>