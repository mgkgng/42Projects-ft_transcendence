import { Module } from '@nestjs/common';
import { JwtStrategy } from 'src/auth/JwtStrategy';
import { GameController} from './game.controller';
import { GameGateway } from './game.gateway';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameEntity } from 'src/entity/Game.entity';
import { MainServerModule } from 'src/mainServer/mainServer.module';

@Module({
  controllers: [GameController],
  providers: [GameGateway, JwtService],
	imports :	[TypeOrmModule.forFeature([GameEntity]), MainServerModule]
})
export class GameModule {}
