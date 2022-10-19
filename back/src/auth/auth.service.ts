import { Injectable} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService,
				private readonly httpService: HttpService,
				private jwtService: JwtService,
	) {}

	async validateUser(username: string, pass: string): Promise<any> {
		const  user = await this.userService.findOne(username);
		if (user && user.password === pass && user.is_42_user === false) {
			const { password, ...result } = user;
			return result;
		}
		return (null);
	}
	async validateUser42(code: string): Promise<any> 
	{
		const iud = process.env.IUD;
		const secret = process.env.SECRET_APP;
		try {
			const rep = await lastValueFrom(this.httpService.post("https://api.intra.42.fr/oauth/token", "grant_type=authorization_code&code=" + code + "&client_id=" + iud + "&client_secret=" + secret + "&redirect_uri=http://localhost:3002"));
			const res = await lastValueFrom(this.httpService.get("https://api.intra.42.fr/v2/me", {headers: {Authorization: "Bearer " + rep.data.access_token}}));
			console.log(res);
			return (res);
		} catch (error) {	return null;	}
	//GET USER TOKEN 42
	//curl -X POST --data "grant_type=authorization_code&code=05f24d0b820b8194b9ab275d58893ebc1bfdbf365107defdfda71d0c3b91c895&client_id=7e2bea32b8d407dab9d25b1ab4ff8ec14118a99e50807a191bc47334ed598658&client_secret=6b31c4520302aa4d4a95629470417da18ad14e45d39d90522fbb105bd00e9b9d&redirect_uri=http://localhost:3001" https://api.intra.42.fr/oauth/token
	//{"access_token":"190792150e933545ee37f7766f00b0b454f6e3c335430a3ab591674c28e1c168","token_type":"bearer","expires_in":7200,"refresh_token":"5f94f5871c7769b7cd456c5812c82a2c2017706ee163732016fdec1cd3e865ca","scope":"public","created_at":1660930810}	
	//GET USER INFO
	//curl  -H "Authorization: Bearer 190792150e933545ee37f7766f00b0b454f6e3c335430a3ab591674c28e1c168" "https://api.intra.42.fr/v2/me"
	}
	async login(user: any) {
		const payload = { username: user.username, sub: "42"};
		return {
		  access_token: this.jwtService.sign(payload, {secret: process.env.SECRET}),
		};
 	}
}
