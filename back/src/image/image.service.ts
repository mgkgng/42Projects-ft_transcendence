import { Repository } from 'typeorm';
import { ImageEntity } from 'src/entity/Image.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
    constructor(
        private imageRepository : Repository<ImageEntity>,
    ){}
    async uploadImage(image : ImageEntity) {
        return await this.imageRepository.save(image);
    }
}