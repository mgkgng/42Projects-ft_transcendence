import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity 
{
	@PrimaryGeneratedColumn()
	id: number;

	@Column()	
	email: string;

	@Column({ unique: true })
	username: string;

	@Column()	
	password: string;

	@Column({default: false})
	is_42_user?: boolean;
}