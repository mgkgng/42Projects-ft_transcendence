import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { MessageChatRoomEntity } from "./MessageChatRoom.entity";
import { UserChatRoomEntity } from "./UserChatRoom.entity";

@Entity()
export class ChatRoomEntity {
	@PrimaryGeneratedColumn()
	id_g: number;

	@OneToMany(() => UserChatRoomEntity, (id: UserChatRoomEntity) => id.room)
	relation_userChatRoom: UserChatRoomEntity[];
	
	@OneToMany(() => MessageChatRoomEntity, (user: MessageChatRoomEntity) => user.id_chat_room)
	relation_messageChatRoom: MessageChatRoomEntity[];

	@Column({unique: true})
	name: string;

	@Column()
	date_creation: Date;

	@Column()
	is_password_protected: boolean;

	@Column()
	password?: string;
}