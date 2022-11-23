import { writable } from 'svelte/store';

export const loginState = writable(false);

export const UserType = {
	Player1: 0,
	Player2: 1,
	Watcher: 2
}

export const frameDuration = 20;

export const PaddleSize = {
	"Short" : 40,
	"Normal" : 80,
	"Long" : 130
}

export const MapSize = {
	"Small": [200, 300],
	"Medium": [300, 500],
	"Large": [400, 700]
}

export const PuckSpeed = {
	"Slow" : 3,
	"Normal" : 5,
	"Fast" : 8
}

export const RoomUpdate = {
	NewRoom: 0,
	DeleteRoom: 1,
	PlayerJoin: 2,
	PlayerExit: 3
}

export const PongConfig = {
	PuckSize: 30,
	FrameDuration: 20,
	DeadZoneHeight: 30,
	PaddleHeight: 12
}