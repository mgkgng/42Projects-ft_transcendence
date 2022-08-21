import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoomEntity } from "./ChatRoom.entity";
import { UserEntity } from "./User.entity";

//Messages for all the rooms
@Entity()
export class MessageChatRoomEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.id2)
	id_user: UserEntity;

	@ManyToOne(() => ChatRoomEntity, (user: ChatRoomEntity) => user.id2)
	id_chat_room: ChatRoomEntity;

	@Column()
	date_message: Date;

	@Column()
	content_message: string;
}