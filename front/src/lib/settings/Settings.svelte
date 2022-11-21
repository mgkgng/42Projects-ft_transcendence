<style lang="scss">
	.settings {
		width: 15em;
		height: 9em;

		button {

		}
	}
</style>

<script>
    import { user } from "$lib/stores/user";
    import { onMount } from "svelte";
    import { client } from "$lib/stores/client";

	onMount(() => {
		// 	$client.socket.on("active_double_auth", (data) => {
		// 		user_info.is_2fa = true; 
		// 	});
		// 	$client.socket.on("disable_double_auth", (data) => {
		// 		user_info.is_2fa = false; 
		// 	});
	});
</script>

<div class="vflex window settings">
	<div class="image">
		<img src="" alt="profile">
		<button>modify</button>
	</div>
	<div class="username">
		<p>Username: {$user.username}</p>
		<button>modify</button>
	</div>
	<div class="auth">
		<p>Double Authentification</p>
		<input type="radio" id="on">
		<label for="on">ON</label>
		<input type="radio" id="off">
		<label for="off">OFF</label>
	</div>
	<div>

	</div>
	<div class="buttons">
		<button>Go Back</button>
		<button>Save Changes</button>
	</div>
</div>