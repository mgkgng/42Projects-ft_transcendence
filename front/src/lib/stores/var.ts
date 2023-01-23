import { writable } from 'svelte/store';

export const loaded = writable(false);
export const login = writable(false);

export const UserType = {
	Player1: 0,
	Player2: 1,
	Watcher: 2
}

export const PaddleSize = [40, 80, 120];

export const MapSize = [
	[200, 300],
	[300, 500],
	[400, 700]
]

export const PuckSpeed = [2, 4, 12]

export const RoomUpdate = {
	NewRoom: 0,
	DeleteRoom: 1,
	PlayerJoin: 2,
	PlayerExit: 3
}

export const PongConfig = {
	PuckSize: 12,
	FrameDuration: 40,
	DeadZoneHeight: 20,
	PaddleHeight: 12
}

export const JoinType = {
	Play: 0,
	Watch: 1,
	Invited: 2
}