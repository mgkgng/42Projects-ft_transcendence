import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/JwtStrategy';
import { GameController} from './game.controller';
import { GameGateway } from './game.gateway';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from 'src/entity/Game.entity';
import { MainServerModule } from 'src/mainServer/mainServer.module';
import { UserModule } from 'src/user/user.module';
import { friendSystemService } from 'src/friendSystem/friendSystem.service';
import { UserEntity } from 'src/entity/User.entity';
import { UserFriendEntity } from 'src/entity/UserFriend.entity';
//import { JwtAuthGuard } from 'src/auth/auth.adaptater';
//import { APP_GUARD } from '@nestjs/core';
import { ChatDirectMessageService } from 'src/chatDirectMessage/chatDirectMessage.service';
import { ChatDirectMessageEntity } from 'src/entity/ChatDirectMessage.entity';
import { UserBlockEntity } from 'src/entity/UserBlock.entity';

@Module({
  controllers: [GameController],
  providers: [GameGateway, JwtService, friendSystemService, ChatDirectMessageService],//{
			//provide: APP_GUARD,
			//useClass: JwtAuthGuard,
		//  }],
	imports :	[TypeOrmModule.forFeature([GameEntity, UserEntity, UserBlockEntity, UserFriendEntity, ChatDirectMessageEntity]), MainServerModule, UserModule]
})
export class GameModule {}