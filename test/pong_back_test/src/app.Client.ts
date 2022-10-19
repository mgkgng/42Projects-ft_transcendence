export class Client {
	id: string;
	sock: any;
	callbacksOnConnection: Set<Function>;
	listeners: Map<string, Function>;
	room: string; // room to which the client actually belongs

	//Websocket
	// addEventListener
	// removeEventListener
	constructor(id: string, sock: any) {
		this.id = id;
		this.sock = sock;
		this.listeners = new Map();
		this.room = "";
		
		// this.sock.onmessage = (msg: any) => {
		// 	console.log("receving something", msg);
		// 	this.listeners.get(msg.event)?.(msg.data);
		// }
	}

	onDisconnect(callback: Function) {
		this.sock.addListener('close', callback);
	}
	
	addListener(type: string, callback: Function) {
		this.listeners.set(type, callback);
	}

	removeListener(type: string) {
		this.listeners.delete(type);
	}

	send(data: any) {
		if (this?.sock?.readyState === WebSocket.OPEN) // TODO websocket is not defined
		{
			//console.log('send data = ', data);
			try {
				this?.sock?.send?.(JSON.stringify(data));
			} catch (e) {
				console.trace('Error: [send]', data, e);
			}
			return ;
		}
		// this.queue.push(data);
	}
}