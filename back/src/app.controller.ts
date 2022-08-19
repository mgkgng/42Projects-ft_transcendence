import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  //@Get("/")
  //getHello(): string {
    //return ("Je te baise");
  //}
  
  @UseGuards(AuthGuard('local'))
  @Post('/auth')
  login(): string
  {
      return ("LOGGED");
  }
  @UseGuards(AuthGuard('oauth'))
  @Post("/auth42")
  login42(): string
  {
      return ("LOGGED42");
  }
}
