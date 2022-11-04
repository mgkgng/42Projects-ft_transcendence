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
	export let	username;
	export let content_message;

	function seeUserProfile()
	{

	}
</script>

<div class=container>
	<p class="username" on:click={seeUserProfile}>{username}</p>
	{#if $user.username == username}
		<p class="content_my_message">{content_message}</p>
	{:else}
		<p class="content_other_message">{content_message}</p>
	{/if}
</div>