export class UserRoom{
	is_admin : boolean = false;
	is_owner: boolean = false;
	is_login: boolean = false;
	username : string = "";
	constructor(username : string, is_admin : boolean, is_owner : boolean, is_login : boolean)
	{
		this.is_admin = is_admin;
		this.username = username;
		this.is_owner = is_owner;
		this.is_login = is_login;
	}
};