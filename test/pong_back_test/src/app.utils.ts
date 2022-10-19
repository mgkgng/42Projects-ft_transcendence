export const WsMessage = {
	
}

export function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	let res: string = "";
	for (let i = 0; i < 16; i++)
		res += set[Math.floor(Math.random() * set.length)];
	return (res);
}

export const PaddleSize = {
	XSmall: 20,
	Small : 40,
	Medium : 80,
	Large : 130
}

export const MapWidth = {
	Small: 400,
	Medium: 700,
	Large: 1000
}

export const MapHeight = {
	Small: 400,
	Medium: 800,
	Large: 1000
}