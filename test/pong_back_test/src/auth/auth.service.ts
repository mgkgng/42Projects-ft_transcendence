import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as jose from 'jose';
import { lastValueFrom } from 'rxjs';
import { stringify } from 'querystring';

const UID = "u-s4t2ud-f5ff5811f4e28fa86f612098072826a0d1e9b5dd48ca96888a53143c89c113f0";
const SECRET = "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";
const JWT_ISSUER = "transcendence"
const JWT_AUDIENCE = "students";

const Keys = async () => {
	const { publicKey, privateKey } = await jose.generateKeyPair('ES256');
	return { publicKey, privateKey};
}

@Injectable()
export class AuthService {
	constructor(private readonly httpService: HttpService) {}

	async getToken(code: any) {
		try {
			const res = await lastValueFrom(this.httpService.post("https://api.intra.42.fr/oauth/token", 
			"grant_type=authorization_code&code=" + code
			+ "&client_id=" + UID + "&client_secret=" + SECRET + "&redirect_uri=http://localhost:5555"));
			return (res);
		} catch (e) {
			console.log("Cannot get token.", e);
		}
		return (undefined);
	}
	
	async authentificateUser(code: any) {
		const res = await this.getToken(code);
		const access_token = res?.data.access_token;
	
		if (!access_token)
			return (undefined);
		
		let data = await lastValueFrom(this.httpService.get("https://api.intra.42.fr/v2/me", {
			headers: { Authorization: "Bearer " + res.data.access_token }
		}));
		
		const user = {
			login: (<any>data).data.login,
			displayname: (<any>data).data.displayname,
			image_url: (<any>data).data.image_url,
			campus_name: (<any>data).data.campus[0].name,
			campus_country: (<any>data).data.campus[0].country
		};
	
		const jwt = await new jose.SignJWT(user)
			.setProtectedHeader({ alg: 'ES256' }) // crypt method
			.setIssuer(JWT_ISSUER) // issuer
			.setAudience(JWT_AUDIENCE) // audience
			.setExpirationTime('14d') // expiration time
			.sign((await Keys()).privateKey);
		
		return ({jwt, user});
	}
	
	async askforToken(client: any, code: any) {
		const res = await this.authentificateUser(code);
		if (!res || !res.user || !res.jwt) {
			client.sock.send(JSON.stringify({ event: "LoginTokenError" }));
			return ;
		}
	
		client.sock.send(JSON.stringify({
			event: "ResLoginToken",
			data: {
				jwt: res.jwt,
				user: res.user
			}
		}));

		client.user = res.user;
		return (res.user);
	}
	
	async askVerifyJWT(client: any, jwt: any) {
		try {
			const { payload, protectedHeader } = await jose.jwtVerify(jwt, Keys["publicKey"], {
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE
			});
	
			const user = {
				login: payload?.login,
				displayname: payload?.displayname,
				image_url: payload?.image_url,
				campus_name: payload?.campus_name,
				campus_country: payload?.campus_country	
			};
	
			client.send(JSON.stringify({
				event: "ResVerifyJWT",
				data: {
					success: true,
					jwt: jwt,
					user: user
				}
			}));
			client.user = user;
			return (user);
		} catch (e) {
			console.log('askVeryJWT error: ', e);
			client.sock.send(JSON.stringify({
				event: "ResVerifyJWT",
				data: { success: false }
			}));
		}
		return (undefined);
	}

}
