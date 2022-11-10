import { Controller, Get, Inject, Query } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { ChatDirectMessageEntity } from 'src/entity/ChatDirectMessage.entity';
import { QueryResult, Repository } from "typeorm";
import { UserEntity } from 'src/entity/User.entity';
import { MainServerService } from "src/mainServer/mainServer.gateway";

@Controller()
export class ChatDirectMessageController {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(ChatDirectMessageEntity)
        private chatDirectMessageRepository : Repository<ChatDirectMessageEntity>,
        @Inject(MainServerService)
        private mainServerService : MainServerService
        ) {}

    //Send a direct message from username_sender to username_receiver
    @Get('/sendDirectMessage?')
    async handleSendDirectMessage(@Query() query: {username_sender: string, username_receiver: string, message: string})
    {
        const qb = this.chatDirectMessageRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        const newDirectMessage = new ChatDirectMessageEntity();
        newDirectMessage.message_sender = await qbu.select().where(`u.username = :username_sender`, {username_sender: query.username_sender}).getOneOrFail();
        newDirectMessage.message_recipient = await qbu.select().where(`u.username = :username_receiver`, {username_receiver: query.username_receiver}).getOneOrFail();
        newDirectMessage.string = query.message.toString();
        newDirectMessage.date = new Date();
        return this.chatDirectMessageRepository.save([newDirectMessage]);
    }

    //Get message history between 2 users
    @Get('/getDirectMessageHistory?')
    async handleGetDirectMessageHistory(@Query() query: {username_sender: string, username_receiver: string})
    {
        const qb = this.chatDirectMessageRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        return await this.chatDirectMessageRepository.find({relations: ['message_sender', 'message_recipient'], where: [
            {message_sender: await qbu.select().where(`u.username = :username_sender`, {username_sender: query.username_sender}).getOneOrFail(), message_recipient: await qbu.select().where(`u.username = :username_receiver`, {username_receiver: query.username_receiver}).getOneOrFail()},
            {message_sender: await qbu.select().where(`u.username = :username_receiver`, {username_receiver: query.username_receiver}).getOneOrFail(), message_recipient: await qbu.select().where(`u.username = :username_sender`, {username_sender: query.username_sender}).getOneOrFail()}
        ], order: {date: "ASC"}});
    }

    @Get('/debugMessage')
    async handleGetHistory()
    {
        const qbu = this.chatDirectMessageRepository.createQueryBuilder("u");

        return await this.chatDirectMessageRepository.find({relations: ['message_sender', 'message_recipient']})
    }
}
