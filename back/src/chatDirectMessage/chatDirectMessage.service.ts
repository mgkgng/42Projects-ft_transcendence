import { Injectable } from '@nestjs/common';
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { ChatDirectMessageEntity } from 'src/entity/ChatDirectMessage.entity';
import { QueryResult, Repository } from "typeorm";
import { UserEntity } from 'src/entity/User.entity';
import { MainServerService } from "src/mainServer/mainServer.service";


@Injectable()
export class ChatDirectMessageService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>,
        @InjectRepository(ChatDirectMessageEntity)
        private chatDirectMessageRepository : Repository<ChatDirectMessageEntity>,
        @Inject(MainServerService)
        private mainServerService : MainServerService
        ) {}

    async handleSendDirectMessage(username_sender_arg: string, username_receiver_arg: string, message: string)
    {
        const qb = this.chatDirectMessageRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        const newDirectMessage = new ChatDirectMessageEntity();
        newDirectMessage.message_sender = await qbu.select().where(`u.username = :username_sender`, {username_sender: username_sender_arg}).getOneOrFail();
        newDirectMessage.message_recipient = await qbu.select().where(`u.username = :username_receiver`, {username_receiver: username_receiver_arg}).getOneOrFail();
        newDirectMessage.string = message.toString();
        newDirectMessage.date = new Date();
        return this.chatDirectMessageRepository.save([newDirectMessage]);
    }

    async handleGetDirectMessageHistory(username_sender_arg: string, username_receiver_arg: string)
    {
        const qb = this.chatDirectMessageRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        return await this.chatDirectMessageRepository.find({relations: ['message_sender', 'message_recipient'], where: [
            {message_sender: await qbu.select().where(`u.username = :username_sender`, {username_sender: username_sender_arg}).getOneOrFail(), message_recipient: await qbu.select().where(`u.username = :username_receiver`, {username_receiver: username_receiver_arg}).getOneOrFail()},
            {message_sender: await qbu.select().where(`u.username = :username_receiver`, {username_receiver: username_receiver_arg}).getOneOrFail(), message_recipient: await qbu.select().where(`u.username = :username_sender`, {username_sender: username_sender_arg}).getOneOrFail()}
        ], order: {date: "ASC"}});
    }
}
