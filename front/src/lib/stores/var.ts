import { writable } from 'svelte/store';

export const loginState = writable(false);

export const UserType = {
	Player1: 0,
	Player2: 1,
	Watcher: 2
}

export const frameDuration = 20;