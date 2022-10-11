import { Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private authService : AuthService) {}
  // constructor(private readonly appService: AppService){}

  @Get("/")
  getHello(): string {
    return ("Je te baise");
  }
  @UseGuards(AuthGuard('jwt'))
  @Get()
  test(): string {
    return "Hello World";
  } 
  @UseGuards(AuthGuard('local'))
  @Post('/auth')
  async  login(@Request() req)
  {
      return (this.authService.login(req.user));
  }
  @UseGuards(AuthGuard('oauth'))
  @Post("/auth42")
  async login42(@Request() req)
  {
      return (this.authService.login(req.user));
  }
}
