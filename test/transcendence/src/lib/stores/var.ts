import { writable } from 'svelte/store';

export const darkMode = writable(true);

export const UserType = {
	Player1: 0,
	Player2: 1,
	Watcher: -1
}