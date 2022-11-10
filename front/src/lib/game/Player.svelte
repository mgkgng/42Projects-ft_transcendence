<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		width: 80px;
		height: 100px;
		color: #fff;

		position: absolute;
		right: 0;
		bottom: 0;

		margin: 10px;

		img {
			width: 100%;
			object-fit: contain;
		}

		div {
			width: 100%;
			text-align: center;
		}
	}

	.left {
		left: 0;
		top: 0;
	}
</style>

<script lang="ts">
	export let userInfo: any;
	export let score: any;
	export let left: boolean;

	console.log(userInfo);
</script>

<div class="container {(left) ? "left" : ""}">
	{#if userInfo}
	<img src={userInfo.image_url} alt="profile"/>
	<div>{userInfo.username}</div>
	<div>{score}</div>
	{:else}
	<img src="/pingu/pingu-coucou.jpeg" alt="pingu" />
	<div>???</div>
	<div style="font-size: 35px;">-</div>
	{/if}
</div>