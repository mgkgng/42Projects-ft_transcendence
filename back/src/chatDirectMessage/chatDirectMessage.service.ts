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
		const qbu = this.userRepository.createQueryBuilder('u');
		const entSender = await qbu.select().where(`u.username = :username_sender`, {username_sender: username_sender_arg}).getOneOrFail();
		const entReceiver = await qbu.select().where(`u.username = :username_receiver`, {username_receiver: username_receiver_arg}).getOneOrFail();

		const messages = await this.chatDirectMessageRepository.createQueryBuilder('message')
		.innerJoinAndSelect('message.message_sender', 'sender')
		.innerJoinAndSelect('message.message_recipient', 'recipient')
		.where('message.message_sender = :sender', { sender: entSender.id_g })
		.andWhere('message.message_recipient = :recipient', { recipient: entReceiver.id_g })
		.orWhere('message.message_sender = :recipient', { recipient: entReceiver.id_g })
		.andWhere('message.message_recipient = :sender', { sender: entSender.id_g })
		.orderBy('message.date', 'ASC')
		.getMany();

		return messages.map((message) => ({
			id: message.id_g,
			sender: message.message_sender.username,
			recipient: message.message_recipient.username,
			message: message.string,
			date: message.date
		}))
	}
}
