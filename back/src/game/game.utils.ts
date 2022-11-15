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
	0 : 40,
	1 : 80,
	2 : 130
}

export const MapSize = {
	0: [200, 300],
	1: [300, 500],
	2: [400, 700]
}

export const PuckSpeed = {
	0 : 3,
	1 : 5,
	2 : 8
}