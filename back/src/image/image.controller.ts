import { ImageService } from "./image.service";
import { ImageEntity } from "src/entity/Image.entity";
import { MainServerService } from "src/mainServer/mainServer.gateway";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { Post } from "@nestjs/common";
import { UseInterceptors } from "@nestjs/common";
import { UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";


// Controller to handle the image upload
@Injectable()
export class ImageController {
    constructor(
        private imageService : ImageService,
    ){}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file) {
        const response = {
            originalname: file.originalname,
            filename: file.filename,
        };
        return response;
    }
}