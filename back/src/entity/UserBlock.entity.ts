import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity()
export class UserBlockEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_userBlocker)
	id_user: UserEntity;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_userBlocked)
	id_user_blocked: UserEntity;
}