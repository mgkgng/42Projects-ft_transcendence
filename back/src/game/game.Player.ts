export class Player {
	username_42: string;
	info: any;
	isHost: boolean;
	score: number;
	index: number;
	control: any;

	constructor(userInfo: any, isHost: boolean, index: number) {
		this.username_42 = userInfo.username_42;
		this.info = userInfo;
		this.isHost = isHost;
		this.score = 0;
		this.index = index;
		this.control = undefined;
	}
}