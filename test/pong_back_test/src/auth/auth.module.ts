import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';

import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
