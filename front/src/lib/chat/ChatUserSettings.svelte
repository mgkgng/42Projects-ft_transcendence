<style lang="scss">
	.settings {
		width: 480px;
		height: 640px;

		.type {
			gap: .2em;
			input { display: none; }
			input[id="with"]:checked+label { background-color: $yellow; }
			input[id="without"]:checked+label { background-color: $red; }

			label {
				display: inline-block;
				border: $border-thin;
				border-radius: .2em;
				width: 7em;
				height: 3em;
				text-align: center;
				padding: .3em;
				font-size: 17px;
				cursor: pointer;
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";

	export let itself: any;
	export let roomName: string;
	export let users: Array<any>;

	const Setting = {
		Mute: 0,
		Ban: 1,
		Admin: 2	
	};

	const explain: Array<string> = [

	];
	
	let settingType: number = Setting.Mute;

</script>

<div class="window settings">
	<div class="flex private">
		<input type="radio" id="mute" bind:group={settingType} name="settingType" value={0}>
		<label for="mute">Mute Users</label>
		<input type="radio" id="ban" bind:group={settingType} name="settingType" value={1}>
		<label for="ban">Ban Users</label>
		<input type="radio" id="admin" bind:group={settingType} name="settingType" value={2}>
		<label for="admin">Set Users Admin</label>
	</div>
	<p>{explain[settingType]}</p>

	<button>Confirm</button>

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