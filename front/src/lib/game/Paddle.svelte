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
	import { UserType, MapSize, PaddleSize } from '$lib/stores/var';


	export let user: any;
	export let playerType: number;
	export let switched: boolean;

	export let mapSize: Array<number>;
	export let paddleWidth : number;

	export let pos : number;
	export let initPos: number;

	export let gameSize: any;
	export let gameInfo: any;

	if (!pos)
		pos = initPos;

	function convertPixelWithHeight(where: number) {
		return ((gameSize.height * where) / MapSize[gameInfo.mapSize][1]);
	}

	function convertPixelWithWidth(where: number) {
		return ((gameSize.width * where) / MapSize[gameInfo.mapSize][0]);
	}
		
</script>

<div class="paddle {(playerType == 1) ? "user" : ""} {(!user) ? "absent" : ""}"
	style="left: {((playerType === 1 && switched) || (playerType === 2 && !switched)) ? convertPixelWithWidth(PongConfig.DeadZoneHeight) : convertPixelWithWidth(mapSize[1] - PongConfig.DeadZoneHeight - PongConfig.PaddleHeight)}px;
		top: {pos}px;
		height: {paddleWidth}px">
</div>