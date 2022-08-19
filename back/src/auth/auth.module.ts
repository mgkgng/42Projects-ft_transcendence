import { Module} from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport'
import { UserEntity } from 'src/user/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LocalStrategy } from './LocalStategy';
import { OAuthStrategy } from './OAuthStrategy';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]), 
		UserModule, PassportModule, HttpModule
	],
	providers: [AuthService, LocalStrategy, OAuthStrategy],
})
export class AuthModule {}
