import { Module } from '@nestjs/common';
import { UserEntity } from 'src/entity/User.entity';
import { friendSystemController } from './friendSystem.controller';
import { friendSystemService } from './friendSystem.service';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UserFriendEntity } from 'src/entity/UserFriend.entity';
import { MainServerService } from 'src/mainServer/mainServer.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, UserFriendEntity])],
    exports: [friendSystemService],
    controllers: [friendSystemController],
    providers: [friendSystemService, JwtService, MainServerService]
})
export class friendSystemModule {}
