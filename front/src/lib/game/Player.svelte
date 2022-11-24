<style lang="scss">
	.player {
		gap: .1em;
		width: 80px;
		color: #fff;

		// position: absolute;
		right: 0;
		bottom: 0;

		.img-box {
			position: relative; 
			margin-top: 5px;

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

		.username {
			width: 100%;
			text-align: center;
			transition: .3s;
			padding: .2em;
			cursor: pointer;
			border-radius: .2em;

			&:hover {
				background-color: transparentize(#fff, .5);
			}
		}

		.who {
			border-radius: .2em;
			width: 80px;
			height: 80px;
			border: $border;
			font-family: 'fake-receipt';
			font-size: 60px;
			text-align: center;
			padding-top: .08em;
			margin-top: 5px;
		}
	}

	.left {
		left: 0;
		top: 0;
	}
</style>

<script lang="ts">
	export let player: any;
	export let left: boolean;
	export let hostname: string;
	export let ready: boolean;

	console.log("check", player);
</script>

<div class="vflex player {(left) ? "left" : ""}">
	{#if player}
	<div class="img-box">
		{#if player.username == hostname}
		<span class="host">HOST</span>
		{:else if ready}
		<span class="ready">READY</span>
		{/if}
		<img src={player.info.img_url} alt="profile"/>
	</div>
	<div class="username">{player.info.username_42}</div>
	{:else}
	<div class="who">?</div>
	{/if}
</div>