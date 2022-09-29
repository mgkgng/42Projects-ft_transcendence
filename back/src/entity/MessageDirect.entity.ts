import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from "typeorm";
import { UserEntity } from "./User.entity";


@Entity()
export class MessageDirectEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Index()
	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_messageDirect)
	id_sender: UserEntity;

	@Index()
	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_messageDirect)
	id_recipient: UserEntity;

	@Column()
	date_message: Date;

	@Column()
	content_message: string;
}
