import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { MessageBody } from "@nestjs/websockets";
import { Passport } from "passport";
import { Strategy } from "passport-local";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, "oauth") {
  constructor(private authService: AuthService, private userService: UserService) {
	super({username: "username", password: "password" , code: "code"});
	//super();
  }

  async validate(@MessageBody() username: string, @MessageBody() code : string): Promise<any> {
	const res = await this.authService.validateUser42(code);
	console.log("Get token : ", code);

	if (res)
	{
		let data = res.data;
		const user : any = {
			login: data.login,
			displayname: data.displayname,
			image_url: data.image_url,
			campus_name: data.campus[0].name,
			campus_country: data.campus[0].country
		};
		if (await this.userService.findOne(res.data.login)) //Check if the user is in db
		{
			const find = ({user});
			console.log("Find:", find);
			return (find);
		}
		else //else create the user in db
		{
			const create = await this.userService.create({username: data.login, password: "42", email: data.email, is_42_user: true, 
														img_url: data.image_url, display_name: user.display_name, campus_country: user.campus_country,
														campus_name: user.campus_name
			});
			if (create)
				return ({username: data.login, email: data.email, is_42_user: true, img: data.image_url});
			else
			{
				console.log("Error create user");
				return null; 
			}
		}
	}
	else
	{
		console.log("Not valided: ", res);
		return null;
	}
  }
}
