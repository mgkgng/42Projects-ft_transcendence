<style lang="scss">
	.container {
		position: absolute;
		top: 0;
		right: 25px;
	}

	.profile-photo {
		width: 25px;
	}
</style>

<script>
    import { user } from "$lib/stores/user";

	console.log("got this", user.image_url);
</script>

<div class="container">
	<div class="profile-photo"></div>
	{#if !user}
	<div></div>
	{:else}
	<img src="{user.image_url}" alt="profile">
	{/if}
</div>