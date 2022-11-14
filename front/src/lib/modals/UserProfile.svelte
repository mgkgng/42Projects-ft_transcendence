<style lang="scss">
	.profile {
		width: 550px;

		overflow: scroll;
	}
	
	.info-zone {
		width: 100%;
		max-height: 400px;
		border-radius: .4em;
		margin-bottom: .2em;

		text-align: center;

		padding: 2em;

		color: #e6e6e6;
	}

	.tool-zone {
		width: 100%;
		height: 80px;
		border-radius: .4em;
		margin-top: .5em;
		margin-bottom: .2em;
		padding: 1em;
		
		gap: .5em;

		button {
			width: 5em;
			aspect-ratio: 1 / 1;
			border-radius: 1em;
			border: 2px solid transparentize(#fff, .5);
			cursor: pointer;
			transition: .2s;

			&:hover {
				transform: scale(1.05);
			}
		}
	}

	.history-zone {
		width: 100%;
		min-height: 200px;
		border-radius: .3em;

		text-align: center;

		border: 2px solid transparentize(#fff, .6);
		padding: 1.2em;
		background-color: transparentize(#000, 0.45);

		color: #e6e6e6;
		font-size: 36px;
	}
</style>

<script lang="ts">
	// export let userInfo;

    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";

	let profileUser: any;

	onMount(() => {

	});
</script>

<div class="window profile">
	<div class="flex info-zone">
		<!-- <div class="photo-zone">
			{#if !profileUser}
			<img src="/pingu/pingu-angry.jpeg" alt="pingu-angry">
			{:else}
			<img src={profileUser.image_url} alt="grosse-tete">
			{/if}
		</div>
		<p>Username: {profileUser.username}</p>
		<p>Campus : {profileUser.campus_name}, {profileUser.campus_country}</p> -->
	</div>
	<!-- {#if $user.username != } -->
	<div class="flex tool-zone">
		<button>Add</button>
		<button>Block</button>
		<button>Message</button>
	</div>
	
	<div class="history-zone">
		No Game History Yet
	</div>
</div>