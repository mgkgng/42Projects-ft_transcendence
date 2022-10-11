import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { WebSocket } from "vite";

// interface Listeners {
// 	name: string;
// 	callback: Function;
// };

class Client {
	listeners: Map<string, Function>;
	socket: WebSocket;
	callbacksOnConnection: Set<Function>;

	constructor() {
		this.listeners = new Map();
		this.callbacksOnConnection = new Set();
		this.socket = undefined;
	}

	connect() {
		if (!browser)
			return ;
		
		this.socket = new WebSocket(`ws://${location.hostname}:3000`);
		this.socket.onopen = () => {

		};
	
	}

	OnConnection(func: Function) {
		this.callbacksOnConnection.add(func);
		if (this.socket?.readyState === WebSocket.OPEN)
			func();
	}
	
	addListener(type: string, callback: Function) {
		this.listeners[type] = callback;
	}

	removeListener(type: string) {
		this.listeners[type] = undefined;
	}

	send(data) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			try {
				this.socket.
			} catch(e) {
				
			}
			return ;
  		}
	}
}