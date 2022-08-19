import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { UserEntity } from './user/user.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: "bd",
      port: 5432,
      username: "macron",
      password: "macron42",
      database: 'macron',
      entities: [UserEntity],
      synchronize: true,
    }), ChatModule, UserModule, AuthModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
