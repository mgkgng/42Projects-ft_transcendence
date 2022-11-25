import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatDirectMessageEntity } from "./ChatDirectMessage.entity";
import { GameEntity } from "./Game.entity";
import { MessageChatRoomEntity } from "./MessageChatRoom.entity";
import { UserBlockEntity } from "./UserBlock.entity";
import { UserChatRoomEntity } from "./UserChatRoom.entity";
import { UserFriendEntity } from "./UserFriend.entity";

@Entity()
export class UserEntity 
{
	@PrimaryGeneratedColumn()
	id_g: number;
	
	@OneToMany(() => UserChatRoomEntity, (user: UserChatRoomEntity) => user.id_user)
	relation_userChatRoom: UserChatRoomEntity[];
	@OneToMany(() => MessageChatRoomEntity, (user: MessageChatRoomEntity) => user.id_user)
	relation_messageChatRoom: MessageChatRoomEntity[];
	@OneToMany(() => GameEntity, (user: GameEntity) => user.player1)
	relation_gamePlayerOne: GameEntity[];
	@OneToMany(() => GameEntity, (user: GameEntity) => user.player2)
	relation_gamePlayerTwo: GameEntity[];
	@OneToMany(() => UserBlockEntity, (user: UserBlockEntity) => user.id_user)
	relation_userBlocker: UserBlockEntity[];
	@OneToMany(() => UserBlockEntity, (user: UserBlockEntity) => user.id_user_blocked)
	relation_userBlocked: UserBlockEntity[];
	@OneToMany(() => UserFriendEntity, (user: UserFriendEntity) => user.id_first_user)
	relation_friend_requested: UserFriendEntity[];
	@OneToMany(() => UserFriendEntity, (user: UserFriendEntity) => user.id_second_user)
	relation_friend_accepted: UserFriendEntity[];
	@OneToMany(() => ChatDirectMessageEntity, (user: ChatDirectMessageEntity) => user.message_sender)
	user_message_send: ChatDirectMessageEntity[];
	@OneToMany(() => ChatDirectMessageEntity, (user: ChatDirectMessageEntity) => user.message_recipient)
	user_message_receive: ChatDirectMessageEntity[];


	@Column()	
	email: string;

	@Column({ unique: true })
	username: string;

	@Column({ unique: true })
	username_42: string;

	@Column()	
	password: string;

	@Column()
	displayname:string;

	@Column()
	campus_name: string;

	@Column()
	campus_country: string;

	@Column({default: false})
	is_42_user?: boolean;

	@Column({default: ""})
	img_url?: string;

	@Column({default: ""})
	img : string;

	@Column({default: false})
	is_2fa?: boolean;	

	@Column({default: ""})
	secret_2fa?: string;

	@Column({default: ""})
	otpauthUrl_2fa?: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
	created_at: Date;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
	last_connection: Date;
}