import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";


@Entity()
export class MessageDirectEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_messageDirect)
	id_sender: UserEntity;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_messageDirect)
	id_recipient: UserEntity;

	@Column()
	date_message: Date;

	@Column()
	content_message: string;
}
