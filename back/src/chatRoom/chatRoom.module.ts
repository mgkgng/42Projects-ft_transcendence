import { Module } from '@nestjs/common';
import { MainServerService } from "src/mainServer/mainServer.service";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entity/User.entity';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';
import { GameEntity } from 'src/entity/Game.entity';
import { MessageChatRoomEntity } from 'src/entity/MessageChatRoom.entity';
import { UserBlockEntity } from 'src/entity/UserBlock.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ChatRoomService } from './chatRoom.gatway';


@Module({
	imports :	[TypeOrmModule.forFeature([UserEntity, UserChatRoomEntity, ChatRoomEntity, GameEntity, MessageChatRoomEntity, UserBlockEntity]),
	],				
    providers: [ChatRoomService, MainServerService, JwtService,]
})
export class ChatRoomModule{}