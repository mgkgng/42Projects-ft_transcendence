import { Module } from '@nestjs/common';
import { ImageEntity } from "src/entity/Image.entity";
import { MainServerService } from "src/mainServer/mainServer.service";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { UserEntity } from 'src/entity/User.entity';

@Module({
	imports :	[TypeOrmModule.forFeature([ImageEntity, UserEntity])],
	exports : [ImageService],
	controllers: [ImageController],
    providers: [MainServerService, JwtService, ImageService]
})
export class ImageModule {}