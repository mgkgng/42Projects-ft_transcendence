import { writable } from "svelte/store";

export let user: any = writable(undefined);

export const UserState = {
	NotConnected: 0,
	Connected: 1,
	Playing: 2
}