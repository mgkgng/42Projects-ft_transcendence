import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity()
export class ChatDirectMessageEntity {
    @PrimaryGeneratedColumn()
	id_g: number;
    
    @ManyToOne(() => UserEntity, (user: UserEntity) => user.user_message_send)
	message_sender: UserEntity; // Les users a qui ont envoie un messages

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.user_message_receive)
	message_recipient: UserEntity; // Les users de qui ont recois les messages

    @Column()
    date: Date;

    @Column()
    string?: string;
}