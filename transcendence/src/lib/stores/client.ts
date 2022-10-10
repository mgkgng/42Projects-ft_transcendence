import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { WebSocket } from "vite";
import { uid } from "/uid";

class Client {
	id: string;
	socket: WebSocket;
	callbacksOnConnection: Set<Function>;

	//Websocket
	// addEventListener
	// removeEventListener
	constructor() {
		this.id = uid();
		this.callbacksOnConnection = new Set();
		this.socket = new WebSocket(`ws://${location.hostname}:3000`);
	}

	connect() {
		if (!browser)
			return ;
		
		this.socket.onopen = () => {
			console.log('Connected');
			this.socket.send(
				JSON.stringify({
					event: "Connexion",
					data: this.id
				})
			)
		};
	}

	OnConnection(func: Function) {
		this.callbacksOnConnection.add(func);
		if (this.socket?.readyState === WebSocket.OPEN)
			func();
	}
	
	addListener(type, callback) {
		this.listeners[type] = callback;
	}

	removeListener(type) {
		this.listeners[type] = undefined;
	}

	send(data) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			try {
				this.socket.s
			} catch(e) {
				
			}
			return ;
  		}
	}
}

export const client = writable(new Client());``