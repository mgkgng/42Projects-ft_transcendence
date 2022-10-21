import * as jose from 'jose';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

const UID = process.env.API42_UID;
const SECRET = process.env.API42_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

const Keys = async () => {
	const { publicKey, privateKey } = await jose.generateKeyPair('ES256');
	return { publicKey, privateKey};
}

async function getToken(code: any) {
	try {
		const options = {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				"grand_type": "authorization_code",
				"client_id": UID,
				"client_secret": SECRET,
				"code": code,
				"redirect_uri": `http://localhost:5555`
			})
		};
		const response = await lastValueFrom(this.httpService.post("https://api.intra.42.fr/oauth/token", options))
		const data = await response.json();
		return (data);
	} catch (e) {
		console.log("Cannot get token.", e);
	}
	return (undefined);
}

async function authentificateUser(code: any) {
	const res = await getToken(code);
	const access_token = res?.access_token;

	if (!access_token)
		return (undefined);
	
	let data = await lastValueFrom(this.httpService.get("https://api.intra.42.fr/v2/me", {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer' + access_token
		}
	}));

	data = await data.json();

	console.log("i got this:", data);

	const user = {
		login: (<any>data).login,
		displayname: (<any>data).displayname,
		image_url: (<any>data).image_url,
		campus_name: (<any>data).campus[0].name,
		campus_country: (<any>data).campus[0].country
	};

	const jwt = await new jose.SignJWT(user)
		.setProtectedHeader({ alg: 'ES256' }) // crypt method
		.setIssuer(JWT_ISSUER) // issuer
		.setAudience(JWT_AUDIENCE) // audience
		.setExpirationTime('14d') // expiration time
		.sign(Keys["privateKey"]);
	
	return ({jwt, user});
}

export async function askforToken(client: any, code: any) {
	try {
		const res = await authentificateUser(code);
		if (!res || !res.user || !res.jwt) {
			client.sock.send({ event: "LoginTokenError" });
			return ;
		}

		client.sock.send({
			event: "ResLoginToken",
			data: {
				jwt: res.jwt,
				user: res.user
			}
		});
		client.user = res.user;
		return (res.user);
	} catch (e) {
		console.log('askForToken error: ', e);
	}
	return (undefined);
}

export async function askVerifyJWT(client: any, jwt: any) {
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
			event: "resVerifyJWT",
			data: { success: false }
		}));
	}
	return (undefined);
}
