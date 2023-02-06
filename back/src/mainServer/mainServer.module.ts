import { Module } from '@nestjs/common';
import { MainServerGateway } from './mainServer.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/User.entity';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';
import { GameEntity } from 'src/entity/Game.entity';
import { MessageChatRoomEntity } from 'src/entity/MessageChatRoom.entity';
import { UserBlockEntity } from 'src/entity/UserBlock.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { MainServerService } from "src/mainServer/mainServer.service";
import { friendSystemService } from 'src/friendSystem/friendSystem.service';
import { UserFriendEntity } from 'src/entity/UserFriend.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
	imports :	[TypeOrmModule.forFeature([UserEntity, UserChatRoomEntity, ChatRoomEntity, GameEntity, MessageChatRoomEntity, UserBlockEntity, UserFriendEntity,
		
	]), ThrottlerModule.forRoot({ limit: 50, ttl: 1 }) ],				
    providers: [MainServerService, JwtService, MainServerGateway, friendSystemService ,    
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		}, ],
	exports : [MainServerService]
})
export class MainServerModule {}
