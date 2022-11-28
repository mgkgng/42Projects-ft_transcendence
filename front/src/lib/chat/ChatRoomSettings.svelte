<style lang="scss">

</style>

<script lang="ts">
    import { ChattRoom } from "$lib/chatt/ChattRoom";

	export let itself: any;
	export let chatRoom: ChattRoom;
</script>

<div class="window settings">
	{#if chatRoom.is_private}
	<input class="button" value="Set private" on:click={unset_private_room}>
	{:else}
	<input class="button" value="Set private" on:click={set_private_room}>
	{/if}
	{#if chatRoom.is_password_protected}
	<input class="button" value="delete password" on:click={unset_password_room}>
	<input class="button" value="Change password" on:click={set_password_room}>
	{:else}
	<input class="button" value="add password" on:click={set_password_room}>
	{/if}

	<div class="buttons">
		<button>Cancel</button>
		<button>Save</button>
	</div>
</div>