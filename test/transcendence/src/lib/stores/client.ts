import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { uid } from "./lib";
// import io from 'socket.io-client';

class Client {
	id: string;
	sock: any;
	callbacksOnConnection: Set<Function>;
	listeners: Map<string, Function>;
	room: string;

	constructor() {
		this.id = uid();
		this.listeners = new Map();
		this.callbacksOnConnection = new Set();
		this.room = "";
		if (browser) {
			this.sock = new WebSocket(`ws://${location.hostname}:3000`);
			this.sock.onmessage = (msg: any) => {
				this.listeners.get(msg.event)?.(msg.data);
			}
			this.connect();
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
					data: this.id
				})
			)

			for (let func of this.callbacksOnConnection)
				func();
		};

		this.sock.onmessage = (msg: any) => {
			let data = JSON.parse(msg.data);
			console.log("OnMessage", data);
			console.log(this.listeners);
			this.listeners.get(data.event)?.(data?.data);
		}
	}

	OnConnection(func: Function) {
		this.callbacksOnConnection.add(func);
		if (this.sock?.readyState === WebSocket.OPEN)
			func();
	}

	removeOnConnection(func: Function) {
		this.callbacksOnConnection.delete(func);
	}
	
	addListener(listener: string, callback: Function) {
		this.listeners.set(listener, callback);
	}

	removeListener(listener: string) {
		this.listeners.delete(listener);
	}

	removeListeners(listeners: Array<string>) {
		for (let listener of listeners)
			this.removeListener(listener);
	}
}

export const client = writable(new Client());