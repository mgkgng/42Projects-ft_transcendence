<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
		width: 550px;
		background-color: transparentize(#000, 0.2);
		padding: 2em;
		border-radius: 2em;
	}
	
	.photo-zone {
		width: 100%;
		min-height: 200px;

		img {
			width: 100%;
		}
	}

	.tool-zone {
		width: 100%;
		height: 80px;
		border-radius: .4em;
		margin-top: .5em;
		margin-bottom: .2em;
		padding: 1em;
		
		border: 2px solid transparentize(#fff, .6);
		background-color: transparentize(#fff, .9);
		color: #e6e6e6;

		display: flex;
		flex-direction: row;
		gap: .5em;

		button {
			width: 5em;
			aspect-ratio: 1 / 1;
			border-radius: 1em;
			border: 2px solid transparentize(#fff, .6);
			cursor: pointer;
			transition: .2s;

			img {
				width: 100%;
				height: 100%;
			}

			&:hover {
				transform: scale(1.05);
			}
		}
	}

	.info-zone {
		width: 100%;
		max-height: 400px;
		border-radius: .4em;
		margin-bottom: .2em;

		text-align: center;

		border: 2px solid transparentize(#fff, .6);

		padding: 2em;

		color: #e6e6e6;
	}

	.history-zone {
		width: 100%;
		min-height: 200px;
		border-radius: .3em;

		text-align: center;

		border: 2px solid transparentize(#fff, .6);
		padding: 1.2em;

		color: #e6e6e6;
		font-size: 36px;
	}
</style>

<script lang="ts">
	// export let userInfo;

    import { user } from "$lib/stores/user";

</script>

<div class="container">
	<div class="photo-zone">
		{#if !$user}
		<img src="/pingu/pingu-angry.jpeg" alt="pingu-angry">
		{:else}
		<img src={$user.image_url} alt="grosse-tete">
		{/if}
	</div>
	<div class="tool-zone">
		<button>
			<img src="/logo-test/add.svg" alt="add"/>
		</button>
		<button>
			<img src="/logo-test/block.svg" alt="add"/>
		</button>
		<button>
			<img src="/logo-test/chat.svg" alt="add"/>
		</button>
	</div>
	<div class="info-zone">
		<p>Username: {$user.username}</p>
		<p>Campus : {$user.campus_name}, {$user.campus_country}</p>
	</div>
	<div class="history-zone">
		No Game History Yet
	</div>
</div>