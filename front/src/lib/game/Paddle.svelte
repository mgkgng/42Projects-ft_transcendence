<style lang="scss">
	.paddle {
		position: absolute;
		margin: 0;
		width: 12px;
		background-color: #fff;

		border-radius: .2em;

		z-index: 2;

		// border: 5px solid $red;
		box-shadow: 0px 0px 5px 5px $main-bright;
	}

	.absent {
		background-color: rgb(90, 84, 84);
		box-shadow: none;
	}

	.user {
		margin: 0;
		box-shadow: 0px 0px 5px 5px $submain-blue;
	}
</style>

<script lang="ts">
    import { PongConfig } from "$lib/stores/var";

	export let user: any;
	export let playerType: number;
	export let switchPlace: boolean;

	export let gameHeight : number;
	export let paddleWidth : number;

	export let pos : number;
	export let initPos: number;

	if (!pos)
		pos = initPos;

</script>

<div class="paddle {(playerType == 1) ? "user" : ""} {(!user) ? "absent" : ""}"
	style="left: {((playerType === 1 && switchPlace) || (playerType === 2 && !switchPlace)) ? PongConfig.DeadZoneHeight : gameHeight - PongConfig.DeadZoneHeight - PongConfig.PaddleHeight}px;
		top: {((playerType === 1 && switchPlace) || (playerType === 2 && switchPlace)) ? pos - paddleWidth : pos}px;
		height: {paddleWidth}px">
</div>