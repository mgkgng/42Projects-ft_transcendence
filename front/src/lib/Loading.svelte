<style lang="scss">
	.container {
		position: relative;
		width: 100%;
		height: 100%;

		@keyframes move {
			0% {
				top: 100%;
			}
			to {
				top: 0;
			}
		}
		.puck {
			position: absolute;
			left: 50%;
			top: 100%;

			width: 30px;
			height: 30px;
			border-radius: 50%;
			background-color: #fff;
			box-shadow: 0px 0px 50px 10px #fff;

			animation-name: move;
			animation-duration: 15s;
			animation-iteration-count: infinite;
			animation-timing-function: linear;
		}
		.paddle {
			position: absolute;
			left: 45%;
			width: 120px;
			height: 12px;
			border-radius: .5em;
			background-color: #fff;
		}
	}
</style>

<div class="container">
	<div class="puck"></div>
	<div class="paddle"></div>
</div>