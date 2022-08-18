import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy)
{
    constructor (private auth_serv : AuthService)
    {
        super();
    }
    async validate (username: string, password: string): Promise<any>
    {
        const user = await this.auth_serv.validateUser(username, password);
        if (!user)
        {
            throw new HttpException({
                status: HttpStatus.UNAUTHORIZED,
                error: 'BITE',
              }, HttpStatus.UNAUTHORIZED)
        }
        return user;
    }
}