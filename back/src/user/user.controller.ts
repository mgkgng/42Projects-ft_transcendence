import { Controller, ForbiddenException, Get, Post, UnauthorizedException} from "@nestjs/common";
import { UserService } from "./user.service";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { AuthGuard } from "@nestjs/passport";

@Controller()
export class UserController 
{
    constructor(private userService : UserService)
    {
    }
    @Get("/John")
    post_addJohn()
    {
        const user = this.userService.addJohn();
        if (!user)
        {
            throw new ForbiddenException();
        }
        return (user);
    }

    @Get("/2FA")
    async post_2FA()
    {
        const secret = authenticator.generateSecret();
        const otpauthUrl = authenticator.keyuri("email@email.com", 'AUTH_APP_NAME', secret);
        const url = await toDataURL("otpauth://totp/Tanscendence:abittel%40student.42nice.fr?secret=JUKQQXBUCV6GMJRR&period=30&digits=6&algorithm=SHA1&issuer=Tanscendence");
        return ({c: url});
    }
}
