<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: .2em;
		width: 80px;
		color: #fff;

		position: absolute;
		right: 0;
		bottom: 0;

		margin: 8px;

		img {
			border-radius: .2em;
			width: 80px;
			height: 80px;
			object-fit: cover;
		}

		div {
			width: 100%;
			text-align: center;
			transition: .5s;
			padding: .2em;
			cursor: pointer;

			&:hover {
				background-color: transparentize(#fff, .5);
			}
		}
	}

	.left {
		left: 0;
		top: 0;
	}
</style>

<script lang="ts">
	export let userInfo: any;
	export let left: boolean;
</script>

<div class="container {(left) ? "left" : ""}">
	{#if userInfo}
	<img src={userInfo.image_url} alt="profile"/>
	<div>{userInfo.username}</div>
	{:else}
	<img src="/pingu/pingu-coucou.jpeg" alt="pingu" />
	<div>???</div>
	{/if}
</div>