<style lang="scss">
	.chatroom {
		width: 77%;

		.read {
			overflow-y: scroll;
			padding: 2em;

			width: 100%;
			height: 70%;

		}
		.write {
			position: relative;
			width: 100%;
			height: 30%;


			input {
				padding-left: 1.5em;
				border-radius: .3em 0 .8em 0;

				width: 100%;
				height: 100%;
				background-color: transparentize(#fff, .8	);
				border-top: $border;
				border-left: $border;
			}

			button {
				position: absolute;
				right: 0;
				bottom: 0;
				width: 3em;
				height: 2em;
				cursor: pointer;
				transition: .3s;
				border-radius: .2em 0 .8em 0;

				&:hover {
					background-color: transparentize(#fff, .7);
				}
			}
		}

		.no-select {
			width: 100%;
			height: 100%;
			justify-content: center;
			align-items: center;
		}
	}

	.users {
		width: 17%;
		gap: 0;

		p {
			padding: 1em;
			text-align: center;
			border-bottom: $border;
			background-color: transparentize($submain-blue, .3);
		}

		.list {
			padding: .8em .5em;
			gap: 0;
			.user {
				padding-left: .5em;
				height: 1.8em;
				cursor: pointer;
				transition: .1s;
				border-radius: .2em 0 .5em .2em;
				&:hover {
					background-color: transparentize(#fff, .7);
				}
			}
		}
	}
</style>

<script lang="ts">
    import ChatRoomMessage from "$lib/chat/ChatRoomMessages.svelte";
    import { ChattRoom } from "$lib/chatt/ChattRoom";

	export let chatRoom: ChattRoom;

	let newMessage: string = "";
</script>

<div class="read">
	{#if chatRoom.is_owner}
		<!-- {#if chat.my_rooms.get(roomSelected).is_owner.is_private}
			<input class="button" value="Set private" on:click={unset_private_room}>
		{:else}
			<input class="button" value="Set private" on:click={set_private_room}>
		{/if}
		{#if chat.my_rooms.get(roomSelected).is_owner.is_password_protected}
			<input class="button" value="delete password" on:click={unset_password_room}>
			<input class="button" value="Change password" on:click={set_password_room}>
		{:else}
			<input class="button" value="add password" on:click={set_password_room}>
		{/if} -->
	{/if}
	{#each chatRoom.messages as message}
		<!-- <ChatRoomMessage username={message.username} content_message={message.message} itself={ itself } axelUserProfileModal={axelUserProfileModal} is_admin={actualMessages.is_admin}/> -->
	{/each}
	</div>
	<div class="write">
		<input class="text-input" placeholder="write your message here..." bind:value={newMessage}>
		<!-- <button on:click={sendMessage}>send</button> -->
	</div>
	<div class="vflex users">
		<p>Online</p>
		<div class="vflex list">
			{#each chatRoom.usersRoom as actual_user}
			<div class="user">
				<div>{actual_user.username}</div>
				<!-- <input type="button" class="btn-room" value="mute" on:click={()=>muteUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="ban" on:click={()=>banUser(actual_user.username)}/>
				<input type="button" class="btn-room" value="set Admin" on:click={()=>setAdmin(actual_user.username)}/> -->
			</div>
			{/each}
		</div>
	</div>