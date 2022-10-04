import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import { Server } from 'socket.io';

const websocketServer = {
	name : 	'websocketServer',
	configureServer(server) {
		const io = new Server(server.httpServer);
		io.on('connection', (socket) => {
			socket.emit('eventFromServer', 'Hello world!');
		})
	}
}

const config: UserConfig = {
	plugins: [sveltekit(), websocketServer],
	server: {
		port: 3001
	}
};

export default config;
