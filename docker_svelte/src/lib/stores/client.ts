import { writable } from "svelte/store";
import { browser } from "$app/environment";
import { uid } from "./lib";
import io from "socket.io-client";

class Client {
	id: string;
	sock: any;
	socket: any;
	callbacksOnConnection: Set<Function>;
	listeners: Map<string, Function>;

	constructor() {
		this.id = uid();
		this.listeners = new Map();
		this.callbacksOnConnection = new Set();
		if (browser) {
			this.sock = new WebSocket('ws://localhost:3000');
			console.log(this.sock);
			this.sock.onmessage = (msg: any) => {
				console.log("receving something", msg);
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
			// console.log("OnMessage", data);
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
	//AXEL MODIFICATION	
	async send42Tok(url: any)
	{
		if (localStorage.getItem('transcendence-jwt') != null)
		{
			const tok = localStorage.getItem('transcendence-jwt');
			
			try
			{
				this.socket = io("http://localhost:3000",{
					extraHeaders: {
						Authorization: "Bearer " + tok,
					}
				});
				return (true);
			}
			catch
			{
				return (false);
			}
		}
		if (url.has('code'))
		{
			console.log(url.get('code'));
			console.log("username=oui&password=" + url.get('code'));
			let tok : any;
			const res : any = await fetch("http://localhost:3000/auth42",{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				  },
				body:JSON.stringify({username: "oui", password: url.get('code')}),
			}).then(function(res : any) {
				tok = res.access_token;
			});
			this.socket = io("http://localhost:3000",{
				extraHeaders: {
					Authorization: "Bearer " + tok,
				}
			});
			localStorage.setItem('transcendence-jwt', tok);
			return (true);
		}
		return (false);
	}
	//END MODIFICATION
}

export const client = writable(new Client());