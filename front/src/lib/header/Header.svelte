<style lang="scss">
	header {
		position: absolute;
		width: 100%;
		height: 75px;

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

		width: 50px;
		border-radius: 5em;

		cursor: pointer;

		img {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
	}

</style>

<script lang="ts">
    import { goto } from "$app/navigation";
    import UserProfile from "$lib/modals/UserProfile.svelte";
    import { loginState } from "$lib/stores/var";
    import Modal from "$lib/tools/Modal.svelte";

	let profileModal: any;
	let login: boolean;

	loginState.subscribe(value => {
		login = value;
	})
</script>

<Modal bind:this={profileModal} closeOnBgClick={true}>
	<UserProfile />
</Modal>

<header>
	<div class="logo" on:click={() => {
		goto('/');
	}}>
		<img src="/logo.svg" alt="logo">
	</div>

	<div class="profile" on:click={() => {
		profileModal.open();
	}}>
		<img src="/pingu/pingu-coucou.jpeg" alt="pingu-coucou">
	</div>
</header>


