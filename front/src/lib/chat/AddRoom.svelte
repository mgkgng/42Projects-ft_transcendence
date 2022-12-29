<style lang="scss">
	.add {
		width: 25em;
		height: 10em;
		border: $border;
		background-color: #313131;
		border-radius: .2em;
		gap: .5em;
		padding: 1.2em;

		.access {
			gap: .3em;

			input[type="radio"] { display: none; }

			label {
				display: inline-block;
				border: $border-thin;
				border-radius: .2em;
				width: 5em;
				height: 1.8em;
				text-align: center;
				padding: .2em;
				font-size: 17px;
				cursor: pointer;
			}
			
			input[type="radio"]:checked + label { background-color: $main-bright;  }
			input[id="private"]:checked + label { background-color: $main-bright;  }
		}
		.input {
			gap: 0.5em;

			.info {
				gap: .3em;
				width: 78%;

				p {
					padding-left: .3em;
					font-size: 14px;
				}
		
				.text-input {
					border-radius: .2em;
					padding-left: .5em;
		
					width: 100%;
					height: 1.8em;
		
					background-color: #fff;
					color: #000;
				}
		
				.empty {
					border-radius: .2em;
					width: 100%;
					height: 1.8em;
					background-color: #000;
				}
			}
			
			.submit {
				width: 20%;
				gap: .5em;
				align-items: center;
				
				button {
					width: 100%;
					border: $border;
					border-radius: .3em;
					padding: .2em .5em;
					background-color: $main-bright;
				}
				.check {
					align-items: center;
					gap: .2em;
					font-size: 14px;
				}
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";

	export let itself: any;

	let newRoomTitle: string;
	let newRoomPassword: string = "";
	let withPassword: boolean = false;
	let isPrivate: boolean = false;
</script>

<div class="vflex window add">
	<div class="flex access">
		<input type="radio" id="public" bind:group={isPrivate} name="isPrivate" value={false}/>
		<label for="public">Public</label>
		<input type="radio" id="private" bind:group={isPrivate} name="isPrivate" value={true}/>
		<label for="private">Private</label>
	</div>
	<div class="flex input">
		<div class="vflex info">
			<input class="text-input" placeholder="Room Name" bind:value={newRoomTitle}>
			{#if (withPassword)}
			<input class="text-input" placeholder="Password" bind:value={newRoomPassword}>
			{:else}
			<div class="empty"></div>
			{/if}
		</div>
		<div class="vflex submit">
			<button on:click={() => {
				$client.socket.emit("new_room", {
					room_name: newRoomTitle, 
					is_password_protected: withPassword, 
					room_password: newRoomPassword, 
					is_private: isPrivate
				});
				itself.close();
			}}>ADD</button>
			<div class="flex check">
				<input class="checkbox" type="checkbox" bind:checked={withPassword}>
				<p>Password</p>
			</div>
		</div>
	</div>
</div>
