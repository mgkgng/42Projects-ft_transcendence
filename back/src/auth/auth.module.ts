import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]), 
		UserModule
	],
	providers: [AuthService, UserService],
})
export class AuthModule {}
