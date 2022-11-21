import { ImageService } from "./image.service";
import { ImageEntity } from "src/entity/Image.entity";
import { MainServerService } from "src/mainServer/mainServer.service";
import { JwtService } from "@nestjs/jwt";
import { Injectable } from "@nestjs/common";
import { Post } from "@nestjs/common";
import { UseInterceptors } from "@nestjs/common";
import { UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Controller } from "@nestjs/common";
import { Get } from "@nestjs/common";
import { Param } from "@nestjs/common";
import { Res, Req } from "@nestjs/common";
import { Buffer } from "buffer";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";


// Controller to handle the image upload
@Controller()
export class ImageController {
    constructor(
        private imageService : ImageService,
        private jwtService: JwtService
    ){}

    @Post('uploadimage')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('avatar', {}))
    async uploadFile(@UploadedFile() file, @Req() request) {
        const token = request.headers.authorization.split(' ')[1];
        const user = this.jwtService.decode(token);
        if (!user)
            return { error: "Invalid token" };
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            console.log("File is an image", file);
            let imageEntity = new ImageEntity();
            imageEntity.img_uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            imageEntity.img_url = "http://localhost:3000/image/" + imageEntity.img_uid;
            imageEntity.img_size = file.size;
            imageEntity.img_name = file.originalname;
            imageEntity.img_type = file.mimetype;
            imageEntity.img_data = file.buffer.toString('base64');
            const imageSaved = await this.imageService.saveImage(imageEntity);
            const imageChanged = await this.imageService.changeUserImage(user.username, imageSaved);
            if (!imageChanged)
                return { error: "Error changing image" };
            else
                return { success: "Image changed" };
        }
        else {
            console.log("File is not an image", file);
            return "File is not an image";
        }
    }

    // Serve image from database to client on get request to /image/:id
    @Get('image/:id')
    async serveImage(@Param('id') id, @Res() res) {
        const image = await this.imageService.getImage(id);
        if (!image)
            return res.status(404).send("Image not found");
        res.set({
            'Content-Type': image.img_type,
            'Content-Length': image.img_size,
            'Content-Disposition': 'inline; filename="' + image.img_name + '"'
        });
        res.send(Buffer.from(image.img_data, 'base64'));
    }
}