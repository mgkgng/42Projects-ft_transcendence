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
		if (await this.userService.findOne(res.data.login))
		{
			const find = ({username: data.login, email: data.email, is_42_user: true, img: data.image_url});
			console.log("Find :");
			console.log(find);
			return (find);
		}
		else
		{
			const create = await this.userService.create({username: data.login, password: "42", email: data.email, is_42_user: true, img: data.image_url});
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
