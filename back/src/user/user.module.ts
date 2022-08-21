import { Controller, Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBody } from '@nestjs/websockets';
import { UserController } from './user.controller';
import { UserEntity } from 'src/entity/User.entity';
import { UserService } from './user.service';
import { UserChatRoomEntity } from 'src/entity/UserChatRoom.entity';
import { ChatRoomEntity } from 'src/entity/ChatRoom.entity';

@Module({
  imports : [TypeOrmModule.forFeature([UserEntity, UserChatRoomEntity, ChatRoomEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports : [UserService]
})
export class UserModule {}
