//import { ExecutionContext, Injectable } from '@nestjs/common';
//import { Reflector } from '@nestjs/core';
//import { AuthGuard } from '@nestjs/passport';

//@Injectable()
//export class JwtAuthGuard extends AuthGuard('jwt') {
//  constructor(private reflector: Reflector) {
//    super();
//	console.log("const");
//  }

//  canActivate(context: ExecutionContext): any {
//	console.log("Test");
//    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
//      context.getHandler(),
//      context.getClass(),
//    ]);
//    if (isPublic) {
//      return true;
//    }
//    return super.canActivate(context);
//  }
//}

import { IoAdapter } from '@nestjs/platform-socket.io';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { throwError } from 'rxjs';

export interface CustomSocket extends Socket {
  user: any;
}

export class WsAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use((socket: Socket, next: any) => {
	  verify(socket.handshake.headers.authorization.split(' ')[1] as string, process.env.SECRET, (err, decoded : any) => { 
		//new WsException("Unauthorized");
		if (err)
		{
			console.log("ERROR");
			throw new HttpException("Unauthorized", 401);
		}
		else
		{
		  if(new Date((decoded.iat + 60 * 60 * 24) * 1000) > (new Date(Date.now())))
		  	next();
		  else
			throw new HttpException("Expired", 401);
		}
	  });
    });
    return server;
  }
}