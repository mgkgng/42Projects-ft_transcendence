import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { MessageBody } from "@nestjs/websockets";
import { Passport } from "passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, "oauth") {
  constructor(private authService: AuthService) {
	super({username: "username", password: "password" , code: "code"});
	//super();
  }

  async validate(@MessageBody() username: string, @MessageBody() code : string): Promise<any> {
	console.log("code: " + code);
	console.log("code2: " + username);
	const res = await this.authService.validateUser42(code);
	if (res)
		return res;
	else
		return null;
  }
}