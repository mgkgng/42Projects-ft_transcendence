<script lang="ts">
	import { client } from '$lib/stores/client.js';
	import { user } from '$lib/stores/user.js';
	import { goto } from '$app/navigation';
	import { onMount } from "svelte";
	import { page } from '$app/stores';

	let error;

	onMount(() => {
		$client.addListener('resForToken', (data) => {
			console.log('resForToken', data);
			user.set(data.user);
			document.cookie = `jwt=${data.jwt}`;
			goto('/home');
		});
		$client.addListener('resErrorForToken', (data) => {
			console.log('hello', data);
			error = data.error;
		});

		const code = String($page.url).split('code=')[1];
		console.log('code = ', code);
		console.log(`${encodeURIComponent(location.origin)}`);
		if (!code)
			goto(`https://api.intra.42.fr/oauth/authorize?client_id=b6a35e161e1517e02154d3f1bb28463675eb17cd13797ac117d3aa8cac6e799b&redirect_uri=${encodeURIComponent(location.origin)}%2Flogin&response_type=code`);
		else {
			$client.send({
				type: "askForToken",
				data: {
					code: code
				}
			});
		}
		return (() => {
			$client.removeListener('resErrorForToken');
			$client.removeListener('resForToken');
		});
	});
</script>

<style lang="scss">
	.loading {
		height: 100vh;
	}
</style>

{#if error}
	<main>
		<p>{error}</p>
		<a href="/">Go back</a>
	</main>
{:else}
		<div class="white loading"/>
{/if}