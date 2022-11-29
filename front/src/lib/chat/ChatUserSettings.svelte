<style lang="scss">
	.settings {
		width: 480px;
		height: 640px;
		padding: 1em;
		align-items: center;
		gap: 0;

		.type {
			gap: .2em;
			input { display: none; }
			input[id="mute"]:checked+label { background-color: $yellow; }
			input[id="ban"]:checked+label { background-color: $red; }
			input[id="admin"]:checked+label { background-color: $red; }

			label {
				display: inline-block;
				border: $border-thin;
				border-radius: .2em .2em 0 0;
				border-bottom: none;
				width: 7em;
				height: 2em;
				text-align: center;
				padding: .3em;
				font-size: 17px;
				cursor: pointer;
			}
		}
		.setting-body {
			width: 100%;
			height: 85%;
			
			border: $border-thin;
			border-radius: .3em;
		}
		.buttons {
			gap: .2em;
			button {
				width: 6em;
				height: 3em;
				border: $border-thin;
				border-radius: .3em;
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
    import { Chatt } from "$lib/chatt/Chatt";

	export let itself: any;
	export let chat: Chatt;
	export let roomName: string;

	let users: Array<string> = chat.my_rooms.get(roomName).users.filter((x:any) => !x.is_admin).map((x: any) => x.username);
	let admins: Array<string> = chat.my_rooms.get(roomName).users.filter((x: any) => x.is_admin).map((x: any) => x.username);

	$: console.log("yo", selected1);

	const Setting = {
		Mute: 0,
		Ban: 1,
		Admin: 2
	};

	const explain: Array<string> = [
		"",
		"",
		""
	];

	function reset(settingType: number) {
		userSet = (settingType != Setting.Admin) ? users : users.filter((x) => { !admins.includes(x); });
		userSelected = [];
		selected1 = [];
		selected2 = [];
		date = tomorrow;
	}

	let userSet: Array<string> = [];
	let userSelected: Array<string> = [];
	let selected1: Array<string> = [];
	let selected2: Array<string> = [];

	let settingType: number = Setting.Mute;

	let today = new Date();
	let tomorrow = new Date(today.setDate(today.getDate() + 2)).toISOString().split('T')[0];
	let date: string = tomorrow;

	$: reset(settingType);
</script>

<div class="vflex window settings">
	<div class="flex type">
		<input type="radio" id="mute" bind:group={settingType} name="settingType" value={0}>
		<label for="mute">Mute Users</label>
		<input type="radio" id="ban" bind:group={settingType} name="settingType" value={1}>
		<label for="ban">Ban Users</label>
		<input type="radio" id="admin" bind:group={settingType} name="settingType" value={2}>
		<label for="admin">Set Admin</label>
	</div>
	<div class="setting-body">
		<p>{explain[settingType]}</p>
		<p>Select Users:</p>
		<div class="flex select">
			<select multiple bind:value={selected1}>
				{#each userSet as user}
				<option value={user}>{user}</option>
				{/each}
			</select>
			<div class="vflex buttons">
				<button on:click={() => {
					userSelected.concat(selected1);
					userSet.filter(x => !selected1.includes(x));
					userSelected = userSelected;
					userSet = userSet;
					selected1 = [];
				}}>&gt;</button>
				<button on:click={() => {
					userSet.concat(selected2);
					userSelected.filter(x => !selected2.includes(x));
					userSelected = userSelected;
					userSet = userSet;
					selected2 = [];
				}}>&lt;</button>
			</div>
			<select multiple bind:value={selected2}>
				{#each userSelected as user}
				<option value={user}>{user}</option>
				{/each}
			</select>

		</div>
		{#if settingType != Setting.Admin}
		<input type="date" id="until" name="date" value={date} min={tomorrow} max="2042-4-2">
		{/if}
	</div>
	<div class="flex buttons">
		<button on:click={() => { itself.open(); }}>Cancel</button>
		<button on:click={() => {
			for (let user of userSelected) {
				if (settingType == Setting.Mute)
					$client.socket.emit("mute_user", { room_name : roomName, username_ban: user, mute_end: undefined});
				else if (settingType == Setting.Ban)
					$client.socket.emit("ban_user", { room_name : roomName, username_ban: user, ban_end: undefined});
				else
					$client.socket.emit("set_admin", { room_name : roomName, username_new_admin: user});
			}
		}}>Confirm</button>
	</div>
</div>