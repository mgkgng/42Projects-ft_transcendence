import { Controller, Get } from '@nestjs/common';

@Controller()
export class ChatDirectMessageController {
    @Get('/test')
    handleTest()
    {
        console.log("test succeed")
    }
}
