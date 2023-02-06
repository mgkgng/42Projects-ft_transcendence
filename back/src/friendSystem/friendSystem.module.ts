import { Module } from '@nestjs/common';
import { UserEntity } from 'src/entity/User.entity';
import { friendSystemController } from './friendSystem.controller';
import { friendSystemService } from './friendSystem.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UserFriendEntity } from 'src/entity/UserFriend.entity';
import { MainServerService } from "src/mainServer/mainServer.service";
import { JwtService } from '@nestjs/jwt';
import { friendSystemGateway } from './friendSystem.gateway';
import { UserBlockEntity } from 'src/entity/UserBlock.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, UserBlockEntity, UserFriendEntity])],
    exports: [friendSystemService],
    controllers: [friendSystemController],
    providers: [friendSystemService, JwtService, MainServerService, friendSystemGateway,{
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
    }, ]
})
export class friendSystemModule {}
