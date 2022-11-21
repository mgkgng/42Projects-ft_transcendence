export function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	let res: string = "";
	for (let i = 0; i < 16; i++)
		res += set[Math.floor(Math.random() * set.length)];
	return (res);
}

export function getRandomInt(max: number) { return Math.floor(Math.random() * max); }

export function replacer() {
    const visited = new WeakSet();
    return ((key, value) => {
		if (typeof value === "object" && value !== null) {
			if (visited.has(value))
				return ;
			visited.add(value);
		}
		return (value);
    });
}

export const PaddleSize = [40, 80, 120];

export const MapSize = [
	[200, 300],
	[300, 500],
	[400, 700]
]

export const PuckSpeed = [3, 8, 13]

export const RoomUpdate = {
	NewRoom: 0,
	DeleteRoom: 1,
	PlayerJoin: 2,
	PlayerExit: 3
}

export const UserState = {
	Available: 0,
	Waiting: 1,
	Playing: 2,
	Watching: 3
}

export const ErrorMessage = {
	UnknownError: "Unknown Error",
	AlreadyJoined: "You already asked for joining game.",
	UserNotAvailble: "You are actually not available.",
	RoomNotFound: "The room couldn't be found.",
	AccessNotPermitted: "You cannot access this room unproperly.",
	RoomDestroyed: "This room doesn't exist anymore.",
	RoomNotAvailble: "The room is not available."
}