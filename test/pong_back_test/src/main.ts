import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// app.useWebSocketAdapter(new WsAdapter(app)); maybe it's not so necessary?

	await app.listen(3000);
	console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap();
