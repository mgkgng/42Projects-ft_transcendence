import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserEntity } from "src/entity/User.entity";
import { Repository } from "typeorm";
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userRepository : Repository<UserEntity>){
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET,
    });
  }

  async validate(payload: any) {
    return { 
      username: payload.username,
      username_42: payload.username_42,
      displayname: payload.displayname,
      image_url: payload.image_url,
      campus_name: payload.campus_name,
      campus_country: payload.campus_country,
      email: payload.email
    };
  }
}