export function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	return (Array(16).map(x => set[Math.random() * set.length]).join(''));
}