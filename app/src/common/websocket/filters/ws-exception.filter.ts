import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();
    const message =
      typeof error === 'string'
        ? error
        : (error as { message?: string }).message || 'WebSocket error';

    this.logger.warn(`WS exception for client ${client.id}: ${message}`);

    client.emit('exception', {
      status: 'error',
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
