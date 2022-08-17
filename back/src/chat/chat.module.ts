import { Module } from '@nestjs/common';
import { ChatService } from './chat.gatway';

@Module({providers: [ChatService]})
export class ChatModule {}
