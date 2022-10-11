import { writable } from "svelte/store";
import { browser } from "$app/environment";

function uid() {
	const set = '0123456789abcdefghiklmnopqrstuvwxyz';
	
	return (Array(16).map(x => set[Math.random() * set.length]).join(''));
}

class Client {
	id: string;
	sock: any;
	callbacksOnConnection: Set<Function>;
	listeners: Map<string, Function>;

	//Websocket
	// addEventListener
	// removeEventListener
	constructor() {
		this.id = uid();
		this.listeners = new Map();
		this.callbacksOnConnection = new Set();
		if (browser) {
			this.sock = new WebSocket('ws://localhost:3000');
			this.sock.onmessage = (msg: any) => {
				this.listeners.get(msg.event)?.(msg.data);
			}
		}
	}

	connect() {
		if (!browser)
			return ;
		
		this.sock.onopen = () => {
			console.log('Connected');
			this.sock.send(
				JSON.stringify({
					event: "Connexion",
					data: {
						id: this.id,
						sock: this.sock
					}
				})
			)
		};
	}

	OnConnection(func: Function) {
		this.callbacksOnConnection.add(func);
		if (this.sock?.readyState === WebSocket.OPEN)
			func();
	}
	
	addListener(type: string, callback: Function) {
		this.listeners.set(type, callback);
	}

	removeListener(type: string) {
		this.listeners.delete(type);
	}

	// send(data: any) {
	// 	if (this.socket?.readyState === WebSocket.OPEN) {
	// 		try {
	// 			this.socket.s
	// 		} catch(e) {
				
	// 		}
	// 		return ;
  	// 	}
	// }
}

export const client = writable(new Client());