import { writable } from "svelte/store";

export let user = writable(undefined);

export function getCookie(name: string) { 
	let cookies = document.cookie.split(';');
	for (let cookie of cookies) {
		let [key, value] = cookie.split('=');
		if (key === name)
			return (value);
	}
	return (undefined);
}
