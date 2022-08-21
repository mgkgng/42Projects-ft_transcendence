import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity()
export class UserBlockEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.id7)
	id_user: UserEntity;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.id8)
	id_user_blocked: UserEntity;
}