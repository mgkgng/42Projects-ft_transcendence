<style lang="scss">
	.container{
		background-color: rgb(124, 120, 120);
		display: flex;
		flex-direction: column;
	}
	.username {
		text-decoration: underline;
		cursor: pointer;
	}

	.content_my_message{
	}
</style>

<script lang="ts">

    import { user } from "$lib/stores/user";
    import { client } from "$lib/stores/client";
	import { chatRoom } from "$lib/stores/chatRoom.ts";
	export let	username : any;
	export let content_message : any;
	export let itself : any;
	export let is_admin : boolean;

	function seeUserProfile()
	{
		chatRoom.update((value) => {
			value.username_search = username;
			return value;
		});
		itself.close();
	}
	function banUser()
	{
		let date : any = prompt("Date: ")
		let res : Date;
		if (date)
		{
			res = new Date(date);
			console.log(res);
			if (isNaN(res.getTime()))
				alert("Bad date");
			else 
				$client.socket.emit("ban_user", { room_name : $chatRoom.actualRoomName, username_ban: username, ban_end: res});
		}
	}
	function muteUser()
	{
		let date : any = prompt("Date: ")
		let res : Date;
		if (date)
		{
			res = new Date(date);
			console.log(res);
			if (isNaN(res.getTime()))
				alert("Bad date");
			else 
				$client.socket.emit("mute_user", { room_name : $chatRoom.actualRoomName, username_ban: username, mute_end: res});
		}
	}
</script>

<div class=container>
	<div style="display: flex; flex-direction: row">
		<p class="username" on:click={seeUserProfile}>{username}</p>
		{#if is_admin == true}
			<input type="button" value="ban" on:click={banUser} />
			<input type="button" value="mute" on:click={muteUser} />
		{/if}
	</div>
	{#if $user.username == username}
		<p class="content_my_message">{content_message}</p>
	{:else}
		<p class="content_other_message">{content_message}</p>
	{/if}
</div>