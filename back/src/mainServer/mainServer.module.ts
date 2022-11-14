import { Module } from '@nestjs/common';
import { MainServerService } from './mainServer.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/User.entity';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';
import { GameEntity } from 'src/entity/Game.entity';
import { MessageChatRoomEntity } from 'src/entity/MessageChatRoom.entity';
import { UserBlockEntity } from 'src/entity/UserBlock.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';


@Module({
	imports :	[TypeOrmModule.forFeature([UserEntity, UserChatRoomEntity, ChatRoomEntity, GameEntity, MessageChatRoomEntity, UserBlockEntity]),
	],				
    providers: [MainServerService, JwtService,],
	exports : [MainServerService]
})
export class MainServerModule {}
