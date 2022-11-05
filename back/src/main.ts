import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {WsAdapter} from './auth/auth.adaptater';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useWebSocketAdapter(new WsAdapter(3001));
  await app.listen(3000);
}
bootstrap();
