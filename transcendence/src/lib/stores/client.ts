import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { WebSocket } from "vite";

class Client {
	socket: WebSocket;
	callbacksOnConnection: Set<Function>;

	//Websocket
	// addEventListener
	// removeEventListener
	constructor() {
		this.callbacksOnConnection = new Set();
		this.socket = new WebSocket(`ws://${location.hostname}:3000`);
	}

	connect() {
		if (!browser)
			return ;
		
		this.socket.onopen = () => {

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

export const client = writable(new Client());