<style lang="scss">
	header {
		position: absolute;
		width: 100%;
		height: 95px;

		z-index: 9999;

		display: flex;
		flex-direction: row;
	}

	.who {
		position: absolute;
		top: 0;
		right: 0;
		width: 65px;
		height: 65px;
		border: $border;
		border-radius: .3em;
		font-size: 48px;
		font-family: 'fake-receipt';
		color: #fff;
		padding-left: .3em;
		padding-top: .05em;
		background-color: transparentize(#fff, .9);
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
			width: 75px;
			height: 75px;
			object-fit: cover;
			border-radius: .4em;
		}

		@keyframes grow {
			0% {
				transform: scaleY(0);
				opacity: 0;
			}
			to {
				transform: scaleY(1);
				opacity: 1;
			}
		}
		.menu {
			// display: none;
			position: absolute;
			top: 85px;
			right: 0;
			border: 2px solid #fff;
			border-radius: .3em;

			color: #fff;
			z-index: 9999;
			transform-origin: top;
	
			&::before {
				content: "";
				top: -20px;
				right: 9px;
				left: auto;
				border: 8px solid transparent;
				border-bottom-color: transparent;
				border-bottom-color: #fff;
				position: absolute;
				display: inline-block;
			}
	
			button {
				width: 100%;
				padding: 1em 1.2em;
				cursor: pointer;
				display: flex;
				text-align: center;
				transition: .1s;

				&:hover {
					filter: brightness(80%);
					background-color: transparentize(#fff, .6);
				}
				// &:nth-child(odd):hover { background-color: transparentize(#fff, .6); }
				// &:nth-child(even):hover { background-color: transparentize(#fff, .6); }
			}
		}
		&:focus-within .menu {
			display: block;
			animation: grow .2s ease-in-out;
		}
	}
</style>

<script lang="ts">
    import UserProfile from "$lib/profile/UserProfile.svelte";
    import { user } from "$lib/stores/user";
    import { client } from "$lib/stores/client";
    import { loginState } from "$lib/stores/var";
    import Modal from "$lib/tools/Modal.svelte";
	import Friends from "$lib/modals/Friends.svelte"
    import { chatRoom } from "$lib/stores/chatRoom";

	let profileModal: any;
	let login: boolean;
	let friendsModal: any;


	$:console.log($user);

	loginState.subscribe(value => { login = value; })

	function handleLogout() {
		localStorage.removeItem("transcendence-jwt");
		loginState.set(false);
		window.location.reload();
	}
</script>

<Modal bind:this={profileModal} >
	<UserProfile profileUser={$client.user_info}  />
</Modal>
<Modal bind:this={friendsModal}>
	<Friends itself={friendsModal} />
</Modal>

<header>
	<div class="profile">
		{#if !$user}
		<div class="who">?</div>
		{:else}
		<div class="summary">
			{#if !$client.user_info || $client.user_info.img === ""}
				<img src={$user.image_url} alt="profile" />
			{:else}
				<img src={$client.user_info.img} alt="profile" />
			{/if}
		</div>
		<div class="menu">
			<button on:click={()=>{
				profileModal.open(); 
			}}>Profile</button>
			<button on:click={()=>{ friendsModal.open(); }}>Friends</button>
			<button on:click={handleLogout}>Logout</button>
		</div>
		{/if}
	</div>
</header>