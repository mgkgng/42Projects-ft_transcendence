import { Module } from '@nestjs/common';
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
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, ChatDirectMessageEntity, UserFriendEntity, UserBlockEntity]),ThrottlerModule.forRoot({ limit: 50, ttl: 1 })],
    exports: [ChatDirectMessageService],
    providers: [ChatDirectMessageService, friendSystemService, JwtService, MainServerService, ChatDirectMessageGateway,{
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    }, ]
})
export class ChatDirectMessageModule {}
