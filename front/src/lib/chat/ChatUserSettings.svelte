<style lang="scss">
	.settings {
		width: 480px;
		height: 640px;
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";

	export let itself: any;
	export let roomName: string;
	export let settingType: number;
	export let users: Array<any>;
</script>

<div class="window settings">
	<!-- <button on:click={() => {
		//TODO "for a limited time"
		$client.socket.emit("mute_user", { room_name : roomName, username_ban: user.username, mute_end: undefined});
	}}>Mute</button>
	<button on:click={() => {
		//TODO "for a limited time"
		$client.socket.emit("ban_user", { room_name : roomName, username_ban: user.username, ban_end: undefined});
	}}>Ban</button>
	<button on:click={() => {
		//TODO confirm message
		$client.socket.emit("set_admin", { room_name : roomName, username_new_admin: user.username});
	}}>Set Admin</button> -->
</div>