import { Module, Post } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBody } from '@nestjs/websockets';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports : [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService]
})
export class UserModule {
  constructor( private readonly userService: UserService) {}
  @Post("/login")
  login(@MessageBody('username') username: string, @MessageBody('password') password: string) {
  }
}
