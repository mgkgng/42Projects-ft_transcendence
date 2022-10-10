export function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	return (Array<string>(16).map(x => set[Math.random() * set.length]).join(''));
}