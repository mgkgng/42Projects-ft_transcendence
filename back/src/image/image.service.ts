import { Repository } from 'typeorm';
import { ImageEntity } from 'src/entity/Image.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ImageService {
    constructor(
		@InjectRepository(ImageEntity)
        private imageRepository : Repository<ImageEntity>,
    ){}
    async uploadImage(image : ImageEntity) {
        return await this.imageRepository.save(image);
    }
}