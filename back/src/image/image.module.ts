import { Module } from '@nestjs/common';
import { ImageEntity } from "src/entity/Image.entity";
import { MainServerService } from "src/mainServer/mainServer.gateway";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageService } from './image.service';

@Module({
	imports :	[TypeOrmModule.forFeature([ImageEntity]),
	],
    providers: [MainServerService, JwtService],
	exports : [ImageService]
})
export class ImageModule {}