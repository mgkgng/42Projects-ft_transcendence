<style lang="scss">
	.buttons { gap: 3em; }

	button {
		width: 140px;
		aspect-ratio: 1 / 1;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		color: #e6e6e6;
		backdrop-filter: blur(6px);
		border: 2px solid transparentize(#fff, .6);
		text-align: center;
		font-size: 25px;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: .2s;

		&:hover {
			filter: brightness(85%);
			transform: translateY(-5px);
		}
	}
	.play { background-color: $main-bright; }
	.rank { background-color: $main-light; }
	.chat { background-color: $submain-lowshadeblue; }
</style>

<script lang="ts">
	export let itself: any;
	export let enterGameModal: any;
	export let chatRoomModal: any;
	export let rankModal: any;
	
</script>

<div class="flex buttons">
	<button class="play" on:click={()=>{
		enterGameModal.open();
		itself.close();
	}}>Play</button>
	<button class="rank" on:click={()=>{
		rankModal.open();
		itself.close();
	}}>Ranking</button>
	<button class="chat" on:click={()=>{
		chatRoomModal.open();
		itself.close();
	}}>Chat</button>
</div>