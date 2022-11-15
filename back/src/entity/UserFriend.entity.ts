import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity()
export class UserFriendEntity {
    @PrimaryGeneratedColumn()
	id_g: number;
    
    @ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_friend_requested)
	id_first_user: UserEntity; // Les User qui mont demander en amis

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_friend_accepted)
	id_second_user: UserEntity; // les User que j'ai accepter en amis
    
    @Column({default: false})
    is_user_friend?: boolean;

	@Column({default: false})
	is_user_refused?: boolean;
}