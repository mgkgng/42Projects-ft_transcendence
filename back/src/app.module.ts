import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UserEntity } from './entity/User.entity';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { UserChatRoomEntity } from './entity/UserChatRoom.entity';
import { ChatRoomEntity } from './entity/ChatRoom.entity';
import { GameEntity } from './entity/Game.entity';
import { MessageChatRoomEntity } from './entity/MessageChatRoom.entity';
import { MessageDirectEntity } from './entity/MessageDirect.entity';
import { UserBlockEntity } from './entity/UserBlock.entity';
import { MainServerService } from './mainServer/mainServer.gateway';
import { MainServerModule } from './mainServer/mainServer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatDirectMessageModule } from './chatDirectMessage/chatDirectMessage.module';
import { ChatRoomService } from './chatRoom/chatRoom.gatway';
import { ChatRoomModule } from './chatRoom/chatRoom.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: "bd",
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_USER,
      synchronize: true,
      autoLoadEntities: true,   
    }),
   MainServerModule, ChatRoomModule , UserModule, AuthModule, HttpModule, JwtModule, ChatDirectMessageModule, ScheduleModule.forRoot() ],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
