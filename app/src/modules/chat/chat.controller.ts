import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatGateway } from './chat.gateway';

@ApiTags('Chat')
@Controller('chat-system')
export class ChatController {
  constructor(private readonly chatGateway: ChatGateway) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  getHealthStatus() {
    const metrics = this.chatGateway.getGatewayMetrics();

    return {
      status: 'operational',
      timestamp: new Date().toISOString(),
      websocket: {
        activeConnections: metrics.connectedClientsCount,
        adapter: metrics.adapterType,
      },
    };
  }
}
