import { Repository } from 'typeorm';
import { ImageEntity } from 'src/entity/Image.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/User.entity';

@Injectable()
export class ImageService {
    constructor(
		@InjectRepository(ImageEntity)
        private imageRepository : Repository<ImageEntity>,
        @InjectRepository(UserEntity)
        private userRepository : Repository<UserEntity>
    ){}

    async saveImage(image : ImageEntity) {
        return await this.imageRepository.save(image);
    }

    async getImage(uid : string) {
        return await this.imageRepository.findOne({where:{img_uid : uid}});
    }

    async changeUserImage(username : string, image : ImageEntity) {
        const user = await this.userRepository.findOne({where:{username : username}});
        if (!user)
            return null;
        if (user.img_url.includes("http://localhost:3000/image/"))
        {
            const imageToDelete = await this.imageRepository.findOne({where:{img_url : user.img_url}});
            if (imageToDelete)
                await this.imageRepository.delete(imageToDelete);
        }
        user.img_url = image.img_url;
        return await this.userRepository.save(user);
    }
}