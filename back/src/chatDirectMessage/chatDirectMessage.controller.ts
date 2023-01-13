import { Controller, Get, Inject, Query } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { ChatDirectMessageEntity } from 'src/entity/ChatDirectMessage.entity';
import { QueryResult, Repository } from "typeorm";
import { UserEntity } from 'src/entity/User.entity';
import { MainServerService } from "src/mainServer/mainServer.service";
import { ChatDirectMessageService } from './chatDirectMessage.service';

@Controller()
export class ChatDirectMessageController {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(ChatDirectMessageEntity)
        private chatDirectMessageRepository : Repository<ChatDirectMessageEntity>,
        @Inject(MainServerService)
        private mainServerService : MainServerService,
        @Inject(ChatDirectMessageService)
        private chatDirectMessageService : ChatDirectMessageService
        ) {}

    //Send a direct message from username_sender to username_receiver
    @Get('/sendDirectMessage?')
    async handleSendDirectMessage(@Query() query: {username_sender: string, username_receiver: string, message: string})
    {
        return this.chatDirectMessageService.handleSendDirectMessage(query.username_sender, query.username_receiver, query.message);
    }

    //Get message history between 2 users
    // @Get('/getDirectMessageHistory?')
    // async handleGetDirectMessageHistory(@Query() query: {username_sender: string, username_receiver: string, date: Date, offset: number})
    // {
    //     return this.chatDirectMessageService.handleGetDirectMessageHistory(query.username_sender, query.username_receiver, query.date, query.offset);
    // }

    @Get('/debugMessage')
    async handleGetHistory()
    {
        const qbu = this.chatDirectMessageRepository.createQueryBuilder("u");

        return await this.chatDirectMessageRepository.find({relations: ['message_sender', 'message_recipient']})
    }

    @Get('getMessageUserList?')
    async handleGetMessageUserList(@Query() query: {username: string})
    {
        return this.chatDirectMessageService.handleGetMessageUserList(query.username);
    }
}
