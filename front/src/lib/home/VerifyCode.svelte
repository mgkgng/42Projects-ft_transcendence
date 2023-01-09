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
	import io, { Socket } from "socket.io-client";
    import { goto } from '$app/navigation';
    import { loaded, login } from "$lib/stores/var";
    import { user } from '$lib/stores/user';

	export let itself: any;
	export let tok : any;
	
	let verifCode: string = "";
	let msg: string = "";
	let loading: boolean = false;

	onMount(() => {
		// $client.socket.on('verify2FAKeyRes', (data: any) => {
		// 	if (data.res === false) {
        //         loading = false;
        //         verifCode = "";
        //         msg = "Wrong verification code";
        //     } else {
        //         itself.close();
        //     }
		// });
		return (() => {

		});
		
	});
	async function try_code(ufa_code : String)
	{
		console.log(tok);
		const res_ufa : any = await fetch("http://localhost:3000/auth42",{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body:JSON.stringify({username: ufa_code, password: tok.tmp_jwt}),
		});
		let res_tok = await res_ufa.json();
		if (res_tok.get_code == null)
		{
			tok = res_tok;
			$client.socket = io("http://localhost:3001",{
				extraHeaders: {
				Authorization: "Bearer " + tok.access_token,
				}
			});
			if (tok.access_token) {
				localStorage.setItem('transcendence-jwt', tok.access_token);
				login.set(true);
			}
			if ($client.socket) {
				$client.socket.on("get_user_info_res", (data: any) => {
					user.set(data);
					login.set(true);
				});
				$client.socket.emit("get_user_info", {});
			}
			goto('/');
			return true; 
		}
		return false;
	}
</script>

<div class="window vflex verify">
	<div class="flex code">
		<input type="text" placeholder="Put your verification code" bind:value={verifCode} />
		<button class="{(loading) ? "loading" : ""}" on:click={async () => {
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
				//$client.socket.emit('verify2FAKey', verifCode);
				let res_test_code = await try_code(verifCode);
				if (res_test_code)
					itself.close();
				else
					msg = "Bad Code";
				loading = false;
			}
		}}>{(!loading) ? "Verify" : ""}</button>
	</div>
	<p>{msg}</p>
</div>