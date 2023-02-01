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

    async handleSendDirectMessage(username42_sender_arg: string, username42_receiver_arg: string, message: string)
    {
        const qb = this.chatDirectMessageRepository.createQueryBuilder('u');
        const qbu = this.userRepository.createQueryBuilder('u');

        const newDirectMessage = new ChatDirectMessageEntity();
        newDirectMessage.message_sender = await qbu.select().where(`u.username_42 = :username_sender`, {username_sender: username42_sender_arg}).getOneOrFail();
        newDirectMessage.message_recipient = await qbu.select().where(`u.username_42 = :username_receiver`, {username_receiver: username42_receiver_arg}).getOneOrFail();
        newDirectMessage.string = message.toString();
        newDirectMessage.date = new Date();
        return this.chatDirectMessageRepository.save(newDirectMessage);
    }

	async handleGetDirectMessageHistory(username_sender_arg: string, username_receiver_arg: string, page: number, pageSize: number) {
		const qbu = this.userRepository.createQueryBuilder('u');
		const entSender = await qbu.select().where(`u.username = :username_sender`, {username_sender: username_sender_arg}).getOneOrFail();
		const entReceiver = await qbu.select().where(`u.username = :username_receiver`, {username_receiver: username_receiver_arg}).getOneOrFail();
		const offset = (page - 1) * pageSize;
	
		let messages : any = await this.chatDirectMessageRepository
			.createQueryBuilder("message")
			.innerJoinAndSelect("message.message_sender", "sender")
			.innerJoinAndSelect("message.message_recipient", "recipient")
			.where("(message.message_sender = :sender AND message.message_recipient = :recipient) OR (message.message_sender = :recipient AND message.message_recipient = :sender)", {
				sender: entSender.id_g,
				recipient: entReceiver.id_g
			})
			.orderBy("message.date", "DESC")
			.skip(offset)
			.take(pageSize)
			.getMany();

			// sort messages in ascending order of date
			messages = messages.sort((a, b) => {
				return a.date - b.date;
			});
			return messages.map(message => {
				return {
					id: message.id_g,
					sender: message.message_sender.username_42,
					recipient: message.message_recipient.username_42,
					message: message.string,
					date: message.date
				}
			});
	}
	


	// async handleGetDirectMessageHistory(username_sender_arg: string, username_receiver_arg: string, limit: number, offset: number) {
	// 	const qbu = this.userRepository.createQueryBuilder('u');
	// 	const entSender = await qbu.select().where(`u.username = :username_sender`, {username_sender: username_sender_arg}).getOneOrFail();
	// 	const entReceiver = await qbu.select().where(`u.username = :username_receiver`, {username_receiver: username_receiver_arg}).getOneOrFail();
	// 	const messages = await this.chatDirectMessageRepository
	// 		.createQueryBuilder("message")
	// 		.innerJoinAndSelect("message.message_sender", "sender")
	// 		.innerJoinAndSelect("message.message_recipient", "recipient")
	// 		.where("(message.message_sender = :sender AND message.message_recipient = :recipient) OR (message.message_sender = :recipient AND message.message_recipient = :sender)", {
	// 			sender: entSender.id_g,
	// 			recipient: entReceiver.id_g
	// 		})
	// 		.orderBy("message.date", "ASC")
	// 		.take(limit)
	// 		.skip(offset)
	// 		.getMany();
	
	// 	return messages.map(message => ({
	// 		id: message.id_g,
	// 		sender: message.message_sender.username,
	// 		recipient: message.message_recipient.username,
	// 		message: message.string,
	// 		date: message.date
	// 	}));
	// }
	


	// Take string : username as parameter and return a list of the 
	// user that u have message with in descending order of the last message send or received
	async handleGetMessageUserList(username42: string) {
		const user = await this.userRepository.createQueryBuilder('u')
			.where('u.username_42 = :username42', { username42 })
			.getOne();

		if (!user) {
			return [];
		}

		const directMessages = await this.chatDirectMessageRepository.createQueryBuilder('dm')
			.innerJoinAndSelect('dm.message_sender', 'message_sender')
			.innerJoinAndSelect('dm.message_recipient', 'message_recipient')
			.where('message_sender.username_42 = :username42 OR message_recipient.username_42 = :username42', { username42 })
			.getMany();

		if (!directMessages || directMessages.length === 0) {
			return [];
		}

		const uniqueUsers = new Set<UserEntity>();
		directMessages
			.filter(dm => dm.message_sender.username_42 !== username42 || dm.message_recipient.username_42 !== username42)
			.forEach(dm => {
				const sender = dm.message_sender.username_42;
				const recipient = dm.message_recipient.username_42;
				if (sender !== username42) {
					uniqueUsers.add({ ...dm.message_sender });
				}
				if (recipient !== username42) {
					uniqueUsers.add(dm.message_recipient);
				}
			});

		const messageDateMap = new Map<string, Date>();
		directMessages
			.filter(dm => dm.message_sender.username !== username42 || dm.message_recipient.username !== username42)
			.forEach(dm => {
				const sender = dm.message_sender.username_42;
				const recipient = dm.message_recipient.username_42;
				if (sender !== username42) {
					if (messageDateMap.has(sender)) {
						if (messageDateMap.get(sender) < dm.date) {
							messageDateMap.set(sender, dm.date);
						}
					} else {
						messageDateMap.set(sender, dm.date);
					}
				}
				if (recipient !== username42) {
					if (messageDateMap.has(recipient)) {
						if (messageDateMap.get(recipient) < dm.date) {
							messageDateMap.set(recipient, dm.date);
						}
					} else {
						messageDateMap.set(recipient, dm.date);
					}
				}
			});

		return Array.from(uniqueUsers)
			.map(user => ({
				username: user.username,
				username_42: user.username_42,
				display_name: user.displayname,
				campus_name: user.campus_name,
				campus_country: user.campus_country,
				img_url: user.img_url,
				last_connection: user.last_connection,
				created_at: user.created_at,
				status: this.mainServerService.getUserStatus(user.username),
				messageDate: directMessages.find(dm => dm.message_sender.username === user.username || dm.message_recipient.username === user.username).date
			}))
			.reduce((acc, user) => {
				if (acc.find(u => u.username === user.username)) {
					const existingUser = acc.find(u => u.username === user.username);
					if (messageDateMap.get(existingUser.username) < messageDateMap.get(user.username)) {
						acc = acc.filter(u => u.username !== user.username);
						acc.push(user);
					}
				} else {
					acc.push(user);
				}
				return acc;
			}, []);
			//.sort((user1, user2) => messageDateMap.get(user2.username).getTime() - messageDateMap.get(user1.username).getTime());
	}
}
