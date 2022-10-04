import { Controller, ForbiddenException, Get, Post, UnauthorizedException} from "@nestjs/common";
import { UserService } from "./user.service";


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
}
