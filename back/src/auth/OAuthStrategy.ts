import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { MessageBody } from "@nestjs/websockets";
import { Passport } from "passport";
import { Strategy } from "passport-local";
import { UserEntity } from "src/entity/User.entity";
import { UserService } from "src/user/user.service";
import { AuthService } from "./auth.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { authenticator } from "otplib";

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, "oauth") {
  constructor(private authService: AuthService, private userService: UserService,
		@InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>) {
	super({username: "username", password: "password" , code: "code"});
	//super();
  }

  async validate(@MessageBody() username: string, @MessageBody() code : string): Promise<any> {
	const res = await this.authService.validateUser42(code);
	console.log("Get token : ", code);
	console.log(res);
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
		const user_bd = await this.userService.findOne(res.data.login);
		if (user_bd) //Check if the user is in db
		{
			const find = ({
				username: user_bd.username,
				username_42: data.login,
				displayname: data.displayname,
				image_url: data.image_url,
				campus_name: data.campus[0].name,
				campus_country: data.campus[0].country,
				email: data.email,
			});
			return (find);
		}
		else //else create the user in db
		{
			let new_user = new UserEntity();
			new_user.username = user.login;
			new_user.username_42 = user.login;
			new_user.email = data.email;
			new_user.password = "42";
			new_user.display_name = data.displayname;
			new_user.campus_name = data.campus[0].name;
			new_user.campus_country = data.campus[0].country;
			new_user.is_42_user = true;
			new_user.img_url = data.image_url;
			new_user.is_2fa = false;
			new_user.secret_2fa = authenticator.generateSecret();
			new_user.otpauthUrl_2fa = authenticator.keyuri(new_user.email, 'AUTH_APP_NAME', new_user.secret_2fa);
			try {
				const create = await this.userRepository.save([new_user]);
				return ({username: data.login,
					username_42 : data.login,
					displayname: data.displayname,
					image_url: data.image_url,
					campus_name: data.campus[0].name,
					campus_country: data.campus[0].country,
					email: data.email
				});
			}
			catch
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