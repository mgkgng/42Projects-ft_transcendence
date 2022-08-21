import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity()
export class GameEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.id5)
	player1: UserEntity;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.id6)
	player2: UserEntity;

	@Column()
	player1_score: number;

	@Column()
	player2_score: number;

	@Column()
	date_game: Date;

	@Column()
	is_finished: boolean;

	@Column()
	is_cancelled: boolean;

	@Column()
	cancelled_player: number;

	@Column()
	is_abandoned: boolean;

	@Column()
	abandoned_player: number;

	@Column()
	is_disconnected: boolean;

	@Column()
	disconnected_player: number;

}