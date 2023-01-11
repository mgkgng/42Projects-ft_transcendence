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

export class WsAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.use((socket: any, next: any) => {
	  verify(socket.handshake.headers.authorization.split(' ')[1] as string, process.env.SECRET, (err, decoded : any) => { 
		if (err)
		{
			// console.log("ERROR", err);
			socket.emit("errors", {message: "UnauthorizedJwt"});
			return (null);
		}
		else
		{
		  if(new Date((decoded.iat + 60 * 60 * 24) * 1000) > (new Date(Date.now())))
		  {
			socket.emit("connection", {});
		  	next();
		  }
		  else
			socket.emit("errors", {message: "UnauthorizedJwt"});
			return (null);
		}
	  });
    });
    return server;
  }
}