import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatRoomEntity } from "./ChatRoom.entity";
import { UserEntity } from "./User.entity";

//All informations about a User in a specific room
@Entity()
export class UserChatRoomEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_userChatRoom)
	id_user: UserEntity;

	@ManyToOne(() => ChatRoomEntity, (room: ChatRoomEntity) => room.relation_userChatRoom)
	room: ChatRoomEntity;

	@Column()
	is_admin: boolean;

	@Column()
	is_banned: boolean;

	@Column({nullable: true})
	ban_end?: Date;

	@Column()
	is_muted: boolean;

	@Column({nullable: true})
	mute_end?: Date;
}
