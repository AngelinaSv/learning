import { Module } from '@nestjs/common';
import { CommonWebsocketModule } from 'src/common/websocket';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [CommonWebsocketModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
