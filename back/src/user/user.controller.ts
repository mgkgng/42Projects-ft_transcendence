import { Controller, ForbiddenException, Get, Post, UnauthorizedException} from "@nestjs/common";
import { UserService } from "./user.service";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";

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
        const url = await toDataURL(otpauthUrl);
        return ({a: otpauthUrl, b: secret, c: url});
    }
}
