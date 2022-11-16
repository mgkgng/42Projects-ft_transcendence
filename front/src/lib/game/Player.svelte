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

		.img-box {
			position: relative; 

			img {
				border-radius: .2em;
				width: 80px;
				height: 80px;
				object-fit: cover;
			}

			span {
				position: absolute;
				width: 3em;
				text-align: center;
				font-size: 12px;
				border-radius: .1em;
			}
			.host {
				border: 1.5px solid $red;
				color: $red;
				background-color: transparentize($red, .8);
			}
			.ready {
				border: 1.5px solid $main-dark;
				color: $main-dark;
				background-color: transparentize($main-dark, .8);
			}
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
	export let host: boolean;
	export let ready: boolean;

	console.log("this is host: ", host, userInfo?.username);
</script>

<div class="container {(left) ? "left" : ""}">
	{#if userInfo}
	<div class="img-box">
		{#if host}
		<span class="host">HOST</span>
		{:else if ready}
		<span class="ready">READY</span>
		{/if}
		<img src={userInfo.image_url} alt="profile"/>
	</div>
	<div>{userInfo.username}</div>
	{:else}
	<img src="/pingu/pingu-coucou.jpeg" alt="pingu" />
	<div>???</div>
	{/if}
</div>