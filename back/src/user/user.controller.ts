import { Controller, Post, Get, UseGuards, Request, UploadedFile, UseInterceptors, ForbiddenException} from '@nestjs/common';
import { FileInterceptor} from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
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
        const url = await toDataURL("otpauth://totp/Tanscendence:abittel%40student.42nice.fr?secret=JUKQQXBUCV6GMJRR&period=30&digits=6&algorithm=SHA1&issuer=Tanscendence");
        return ({c: url});
    }

    @Post('/upload_image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file, @Request() req) {
        return (await this.userService.change_img(this.userService.getUsername(req), file));
    }

    @Post('/delete_image')
    async deleteFile(@Request() req) {
        return (await this.userService.delete_img(this.userService.getUsername(req)));
    }
}
