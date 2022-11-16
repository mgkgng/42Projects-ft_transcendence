import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class ImageEntity {
	@PrimaryGeneratedColumn()
	id_g: number;

	@Column()
	img_url: string;

	@Column()
	img_height: number;

	@Column()
	img_width: number;
}