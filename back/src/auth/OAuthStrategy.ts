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
import { isBuffer } from "util";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, "oauth") {
  constructor(private authService: AuthService, private userService: UserService,
		@InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
		private jwtServer: JwtService 
		) {
	super({username: "username", password: "password" , code: "code"});
	//super();
  }

  async validate(@MessageBody() code_2fa: string, @MessageBody() code : string): Promise<any> {
	let res : any;
	if (code_2fa == "oui")
	{
		res = await this.authService.validateUser42(code);
		res.data.username_42 = res.data.login;
		console.log("Get token : ", code);
		console.log(res);
	}else
	{
		res = {data: (this.jwtServer.decode(code))};
		res.data.campus = [];
		res.data.campus.push({name: res.data.campus_name, country: res.data.campus_country});
		console.log("Res : ", res, code);
	}
	if (res)
	{
		let data = res.data;
		const user : any = {
			login: data.username_42,
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
			if (user_bd.is_2fa)
			{
				if (!this.authService.verify_tmp_jwt(code) || !authenticator.check(code_2fa, user_bd.secret_2fa))
				{
					console.log("2FA", code, code_2fa);
					console.log(authenticator.check(code_2fa, user_bd.secret_2fa))
					return ({error: "2FA code is not valid", user: find});
				}
			}
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
			new_user.otpauthUrl_2fa = authenticator.keyuri(new_user.email, 'Tanscendence', new_user.secret_2fa);
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