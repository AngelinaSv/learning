import { Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  WsExceptionFilter,
  WsJwtGuard,
} from 'src/common/websocket';
import { GLOBAL_CHAT_ROOM } from './chat.constants';
import { ChatModerationService } from './chat-moderation.service';
import { ChatService } from './chat.service';
import {
  ChatMessageBlockedEvent,
  ChatErrorEvent,
  JoinRoomPayload,
  SendMessagePayload,
} from './interfaces/chat-payload.interface';

@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly clientRooms = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly chatModerationService: ChatModerationService,
    private readonly wsJwtGuard: WsJwtGuard,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.wsJwtGuard.authenticate(client);
      client.join(GLOBAL_CHAT_ROOM);
      this.clientRooms.set(client.id, new Set([GLOBAL_CHAT_ROOM]));
      this.logger.log(
        `Client ${client.id} connected to chat as ${user.username}`,
      );
    } catch {
      client.emit('exception', {
        status: 'error',
        message: 'Unauthorized',
        timestamp: new Date().toISOString(),
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const user = client.data.user;
    const rooms = this.clientRooms.get(client.id) || new Set<string>();

    if (user) {
      for (const room of rooms) {
        this.server
          .to(room)
          .emit(
            'roomMessage',
            this.chatService.createLeaveMessage(client, room),
          );
      }
    }

    this.clientRooms.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected from chat`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload | undefined,
  ) {
    try {
      await this.wsJwtGuard.authenticate(client);

      const result = this.chatService.joinRoom(client, payload);

      this.trackClientRoom(client.id, result.joinedRoom);

      if (result.notice) {
        client.to(result.joinedRoom).emit('roomMessage', result.notice);
      }

      return {
        status: 'success',
        joinedRoom: result.joinedRoom,
      };
    } catch (error) {
      return this.emitChatError(client, 'joinRoom', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SendMessagePayload | undefined,
  ) {
    try {
      await this.wsJwtGuard.authenticate(client);

      const message = this.chatService.createRoomMessage(client, payload);

      // Lightweight anti-spam layer for global chat advertising/referral links.
      if (this.chatModerationService.containsForbiddenContent(message.message)) {
        const blockedPayload: ChatMessageBlockedEvent = {
          reason: 'Message contains advertising or forbidden content',
          sanitizedMessage: this.chatModerationService.sanitizeMessage(
            message.message,
          ),
        };

        client.emit('chat:message:blocked', blockedPayload);

        return {
          status: 'blocked',
          ...blockedPayload,
        };
      }

      this.server.to(message.room).emit('roomMessage', message);

      return {
        status: 'success',
        deliveredTo: message.room,
      };
    } catch (error) {
      return this.emitChatError(client, 'sendMessage', error);
    }
  }

  getGatewayMetrics() {
    return {
      connectedClientsCount: this.server?.engine?.clientsCount || 0,
      adapterType: 'SocketIoAdapter',
    };
  }

  private trackClientRoom(clientId: string, room: string) {
    const rooms = this.clientRooms.get(clientId) || new Set<string>();
    rooms.add(room);
    this.clientRooms.set(clientId, rooms);
  }

  private emitChatError(
    client: Socket,
    event: string,
    error: unknown,
  ): ChatErrorEvent {
    const message =
      error instanceof Error ? error.message : 'Unable to process chat event';

    const payload: ChatErrorEvent = {
      status: 'error',
      event,
      message,
      timestamp: new Date().toISOString(),
    };

    client.emit('chatError', payload);

    return payload;
  }
}
