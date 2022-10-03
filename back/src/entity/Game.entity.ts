import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";

@Entity()
export class GameEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_gamePlayerOne)
	player1: UserEntity;

	@ManyToOne(() => UserEntity, (user: UserEntity) => user.relation_gamePlayerTwo)
	player2: UserEntity;

	@Column({nullable: true})
	player1_score?: number;

	@Column({nullable: true})
	player2_score?: number;

	@Column()
	date_game: Date;

	@Column()
	is_finished: boolean;

	@Column()
	is_cancelled: boolean;

	@Column({nullable: true})
	cancelled_player?: number;

	@Column()
	is_abandoned: boolean;

	@Column({nullable: true})
	abandoned_player?: number;

	@Column()
	is_disconnected: boolean;

	@Column({nullable: true})
	disconnected_player?: number;

}