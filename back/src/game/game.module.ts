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

@Module({
  controllers: [GameController],
  providers: [GameGateway, JwtService, friendSystemService],//{
			//provide: APP_GUARD,
			//useClass: JwtAuthGuard,
		//  }],
	imports :	[TypeOrmModule.forFeature([GameEntity, UserEntity, UserFriendEntity]), MainServerModule, UserModule]
})
export class GameModule {}