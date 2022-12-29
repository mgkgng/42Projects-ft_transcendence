<style lang="scss">
	.verify {
		width: 400px;
		height: 200px;

		.code {
			input {
				height: 3em;
			}
		}
	}
</style>

<script lang="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";

	export let itself: any;
	
	let verifCode: string = "";
	let msg: string = "";
	let loading: boolean = false;

	onMount(() => {
		$client.socket.on('verify2FAKeyRes', (data: any) => {
			if (data.res === false) {
                loading = false;
                verifCode = "";
                msg = "Wrong verification code";
            } else {
                itself.close();
            }
		});

		return (() => {

		});
	});
</script>

<div class="window vflex verify">
	<div class="flex code">
		<input type="text" placeholder="Put your verification code" bind:value={verifCode} />
		<button class="{(loading) ? "loading" : ""}" on:click={() => {
			if (loading)
				return 
			if (!verifCode.length) {
				msg = "Please put your verification code";
			} else if (!/^\d+$/.test(verifCode)) {
				msg = "The verification code should only contain digits";
			} else if (verifCode.length != 6) {
				msg = "The verification should be composed of 6 digits"
			} else {
				loading = true;
				$client.socket.emit('verify2FAKey', verifCode);
			}
		}}>{(!loading) ? "Verify" : ""}</button>
	</div>
	<p>{msg}</p>
</div>