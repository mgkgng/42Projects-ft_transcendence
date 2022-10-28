<style lang="scss">
	header {
		position: absolute;
		width: 100%;
		height: 95px;

		z-index: 9999;

		display: flex;
		flex-direction: row;
	}

	.logo {
		cursor: pointer;
		padding-left: 5px;

		img {
			height: 100%;
			object-fit: contain;

		}
	}

	.profile {
		position: absolute;
		top: 0;
		right: 0;
		float: right;

		// width: 50px;
		width: 75px;
		height: 80%;
		border-radius: 5em;

		cursor: pointer;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			border-radius: 1em;
		}
	}

</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import UserProfile from "$lib/modals/UserProfile.svelte";
    import { user } from "$lib/stores/user";
    import { loginState } from "$lib/stores/var";
    import Modal from "$lib/tools/Modal.svelte";

	let profileModal: any;
	let login: boolean;
	let userInfo: any;

	$: console.log("This is user:", $user);


	loginState.subscribe(value => { login = value; })

</script>

<Modal bind:this={profileModal} closeOnBgClick={true}>
	<UserProfile />
</Modal>

<header>
	<div class="logo" on:click={() => {
		goto('/');
	}}>
		<img src="/logot.svg" alt="logo">
	</div>

	<div class="profile" on:click={() => {
		profileModal.open();
	}}>
		{#if !$user}
		<img src="/pingu/pingu-coucou.jpeg" alt="pingu-coucou">
		{:else}
		<img src={$user.image_url} alt="profile" />
		{/if}
	</div>
</header>


