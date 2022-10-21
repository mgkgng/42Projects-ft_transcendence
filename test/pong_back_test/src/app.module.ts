import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '@nestjs/axios';


@Module({
  imports: [AuthModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, AppGateway, AuthService],

})
export class AppModule {}
