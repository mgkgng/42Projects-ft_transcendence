<style lang="scss">
	.container {
		position: absolute;
		top: 0;
		right: 0;

		width: 50px;
		aspect-ratio: 1 / 1;
		border-radius: 5em;

		background-color: #e6e6e6;
		
		cursor: pointer;
	}

	.profile-photo {
		width: 50px;
		border-radius: 5em;

		img {
			width: 100%;
		}
	}
</style>

<script lang="ts">
    import UserProfile from "./modals/UserProfile.svelte";
    import Modal from "./tools/Modal.svelte";

    // import { user } from "$lib/stores/user";

	// console.log("got this", user.image_url);

	let profileModal: any;
</script>

<Modal bind:this={profileModal} closeOnBgClick={true}>
	<UserProfile />
</Modal>

<div class="container" on:click={() => {
	profileModal.open();
}}>
	<div class="profile-photo">
		<img src="/pingu/pingu-coucou.jpeg" alt="pingu-coucou">
	</div>
	<!-- {#if !user}
	<div></div>
	{:else}
	<img src="{user.image_url}" alt="profile">
	{/if} -->
</div>