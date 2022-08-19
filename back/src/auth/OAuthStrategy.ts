import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Passport } from "passport";
import { Strategy } from "passport-local";
import { AuthService } from "./auth.service";

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, "oauth") {
  constructor(private authService: AuthService) {
	super({code: "code"});
  }

  async validate(code: string): Promise<any> {
	return {"Test": "Test"};
	console.log("test1");
	const res = await this.authService.validateUser42(code);
	return res;
  }
}