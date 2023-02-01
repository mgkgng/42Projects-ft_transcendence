import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChatRoomEntity } from "./ChatRoom.entity";
import { UserEntity } from "./User.entity";

//All informations about a User in a specific room
@Entity()
@Unique(["id_user", "room"]) // named; multiple fields
export class UserChatRoomEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_userChatRoom)
	id_user: UserEntity;

	@ManyToOne(() => ChatRoomEntity, (room: ChatRoomEntity) => room.relation_userChatRoom)
	room: ChatRoomEntity;

	@Column({default: false})
	is_admin: boolean;

	@Column({default: false})
	is_owner: boolean;

	@Column()
	is_banned: boolean;

	@Column({nullable: true})
	ban_end?: Date;

	@Column()
	is_muted: boolean;

	@Column({nullable: true})
	mute_end?: Date;

	@Column({default: true})
	is_visible: boolean;
}
