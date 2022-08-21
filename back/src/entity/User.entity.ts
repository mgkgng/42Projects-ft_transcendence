import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { GameEntity } from "./Game.entity";
import { MessageChatRoomEntity } from "./MessageChatRoom.entity";
import { MessageDirectEntity } from "./MessageDirect.entity";
import { UserBlockEntity } from "./UserBlock.entity";
import { UserChatRoomEntity } from "./UserChatRoom.entity";

@Entity()
export class UserEntity 
{
	@PrimaryGeneratedColumn()
	id_g: number;
	
	@OneToMany(() => UserChatRoomEntity, (user: UserChatRoomEntity) => user.id_user)
	id1: UserChatRoomEntity[];
	@OneToMany(() => MessageChatRoomEntity, (user: MessageChatRoomEntity) => user.id_user)
	id2: MessageChatRoomEntity[];
	@OneToMany(() => MessageDirectEntity, (user: MessageDirectEntity) => user.id_sender)
	id3: MessageChatRoomEntity[];
	@OneToMany(() => MessageDirectEntity, (user: MessageDirectEntity) => user.id_recipient)
	id4: MessageDirectEntity[];
	@OneToMany(() => GameEntity, (user: GameEntity) => user.player1)
	id5: GameEntity[];
	@OneToMany(() => GameEntity, (user: GameEntity) => user.player2)
	id6: GameEntity[];
	@OneToMany(() => UserBlockEntity, (user: UserBlockEntity) => user.id_user)
	id7: UserBlockEntity[];
	@OneToMany(() => UserBlockEntity, (user: UserBlockEntity) => user.id_user_blocked)
	id8: UserBlockEntity[];

	@Column()	
	email: string;

	@Column({ unique: true })
	username: string;

	@Column()	
	password: string;

	@Column({default: false})
	is_42_user?: boolean;

	@Column({default: ""})
	img?: string;
}