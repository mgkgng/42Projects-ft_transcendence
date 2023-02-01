<style lang="scss">
	.settings {
		width: 480px;
		height: 320px;
		padding: 1em;
		align-items: center;
		gap: 0;

		.type {
			gap: .2em;
			input { display: none; }
			input[id="mute"]:checked+label { background-color: $yellow; }
			input[id="ban"]:checked+label { background-color: $red; }
			input[id="admin"]:checked+label { background-color: $submain-lowshadeblue; }

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
			justify-content: center;
			align-items: center;
			
			border: $border-thin;
			border-radius: .3em;

			p {
				padding: 0 .8em; 
				text-align: center;
			}

			select {
				width: 12em;
				color: #000;
				background-color: transparentize(#fff, .7);
			}
		}

		.buttons {
			gap: .2em;
			margin-top: .5em;
			button {
				width: 6em;
				height: 3em;
				border: $border-thin;
				border-radius: .3em;
				background-color: $main-bright;

				&:first-child { background-color: $submain-lowshadeblue; }
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { user } from "$lib/stores/user";
    import type { Chatt } from "$lib/chatt/Chatt";

	export let itself: any;
	export let chat: Chatt;
	export let roomID: string;

	let users: Array<string> = chat.my_rooms.get(roomID).users.filter((x:any) => !x.is_admin).map((x: any) => x.username);
	let admins: Array<string> = chat.my_rooms.get(roomID).users.filter((x: any) => x.is_admin).map((x: any) => x.username);

	const Setting = {
		Mute: 0,
		Ban: 1,
		Admin: 2
	};

	const explain: Array<string> = [
		"If you mute an user, he/she will not be able to speak for a limited time.",
		"If you ban an user, he/she will not be able to join the chat room for a limited time.",
		"If you set an user admin, he/she will be able to mute / ban / set admin other users."
	];

	function reset(settingType: number) {
		//userSet = (settingType != Setting.Admin) ? users : users.filter((x) => { !admins.includes(x); });
		userSet = users;
		selected = "";
		date = tomorrow;
	}

	let userSet: Array<string> = [];
	let userSelected: Array<string> = [];
	let selected: string = ""

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
	<div class="vflex setting-body">
		<p>{explain[settingType]}</p>
		<div class="flex">
			<p>Select the User:</p>
			<select bind:value={selected}>
				{#each userSet as user}
				<option value={user}>{user}</option>
				{/each}
			</select>
		</div>
		{#if settingType != Setting.Admin}
		<div class="flex">
			<p>Until:</p>
			<input type="date" id="until" name="date" value={date} min={tomorrow} max="2042-4-2">
		</div>
		{/if}
	</div>
	<div class="flex buttons">
		<button on:click={() => { itself.close(); }}>Cancel</button>
		<button class="{(!selected.length) ? "no-active" : ""}" on:click={() => {
			if (!selected.length)
				return ;
			if (settingType == Setting.Mute)
				$client.socket.emit("mute_user", { id_public_room : roomID, username_ban: selected, mute_end: date});
			else if (settingType == Setting.Ban)
				$client.socket.emit("ban_user", { id_public_room : roomID, username_ban: selected, ban_end: date});
			else
				$client.socket.emit("set_admin", { id_public_room : roomID, username_new_admin: selected});
			selected = "";
		}}>Confirm</button>
	</div>
</div>