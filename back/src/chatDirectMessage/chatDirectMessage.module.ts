import { Module } from '@nestjs/common';
import { ChatDirectMessageController } from './chatDirectMessage.controller';
import { ChatDirectMessageService } from './chatDirectMessage.service';

@Module({
    imports: [],
    exports: [ChatDirectMessageService],
    controllers: [ChatDirectMessageController],
    providers: [ChatDirectMessageService]
})
export class ChatDirectMessageModule {}
