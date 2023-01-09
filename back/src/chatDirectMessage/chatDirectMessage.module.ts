import { Module } from '@nestjs/common';
import { ChatDirectMessageController } from './chatDirectMessage.controller';
import { ChatDirectMessageService } from './chatDirectMessage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatDirectMessageEntity } from 'src/entity/ChatDirectMessage.entity';
import { UserEntity } from 'src/entity/User.entity';
import { UserFriendEntity } from 'src/entity/UserFriend.entity';
import { MainServerService } from "src/mainServer/mainServer.service";
import { JwtService } from '@nestjs/jwt';
import { ChatDirectMessageGateway } from './chatDirectMessage.gateway';
import { friendSystemService } from 'src/friendSystem/friendSystem.service';
import { UserBlockEntity } from 'src/entity/UserBlock.entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChatDirectMessageEntity, UserFriendEntity, UserBlockEntity])],
    exports: [ChatDirectMessageService],
    controllers: [ChatDirectMessageController],
    providers: [ChatDirectMessageService, friendSystemService, JwtService, MainServerService, ChatDirectMessageGateway]
})
export class ChatDirectMessageModule {}
