import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

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
