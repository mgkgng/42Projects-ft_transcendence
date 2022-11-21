import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { Entity } from 'typeorm';

@Entity()
export class ImageEntity {
	@PrimaryGeneratedColumn()
	id_g: number;

	@Column()
	img_uid: string;

	@Column()
	img_url: string;

	@Column()
	img_size: number;

	@Column()
	img_name: string;

	@Column()
	img_type: string;

	@Column()
	img_data: string;
}