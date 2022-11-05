import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: any) {
    console.log("Payload: ", payload);
    console.log("--------------------------------------------------------------------------------------------------");
    return { 
      username: payload.login,
      displayname: payload.displayname,
      image_url: payload.image_url,
      campus_name: payload.campus_name,
      campus_country: payload.campus_country,
      email: payload.email
    };
  }
}