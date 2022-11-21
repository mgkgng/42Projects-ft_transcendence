export function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	let res: string = "";
	for (let i = 0; i < 16; i++)
		res += set[Math.floor(Math.random() * set.length)];
	return (res);
}

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

export const UserState = {
	Available: 0,
	Waiting: 1,
	Playing: 2,
	Watching: 3
}

export const ErrorMessage = {
	UnknownError: "Unknown Error",
	JoinQueueError: "You should be available in order to join game."
}