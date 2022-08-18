import { Controller, ForbiddenException, Post, UnauthorizedException} from "@nestjs/common";
import { UserService } from "./user.service";


@Controller()
export class UserController 
{
    constructor(private userService : UserService)
    {
    }
    @Post("/John")
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
