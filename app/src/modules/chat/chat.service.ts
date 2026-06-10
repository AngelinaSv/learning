import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthenticatedSocket } from 'src/common/websocket';
import {
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_ROOM_MAX_LENGTH,
  GLOBAL_CHAT_ROOM,
} from './chat.constants';
import {
  ChatRoomMessage,
  JoinRoomPayload,
  SendMessagePayload,
} from './interfaces/chat-payload.interface';

@Injectable()
export class ChatService {
  joinRoom(client: AuthenticatedSocket, payload: JoinRoomPayload | undefined) {
    const room = this.normalizeRoom(payload?.room, false);

    client.join(room);

    return {
      joinedRoom: room,
      notice:
        room === GLOBAL_CHAT_ROOM
          ? undefined
          : this.createSystemMessage(
              room,
              `${client.data.user.username} joined ${room}.`,
            ),
    };
  }

  createLeaveMessage(
    client: AuthenticatedSocket,
    room: string,
  ): ChatRoomMessage {
    const message =
      room === GLOBAL_CHAT_ROOM
        ? `${client.data.user.username} left chat.`
        : `${client.data.user.username} left ${room}.`;

    return this.createSystemMessage(
      room,
      message,
    );
  }

  createRoomMessage(
    client: AuthenticatedSocket,
    payload: SendMessagePayload | undefined,
  ): ChatRoomMessage {
    const room = this.normalizeRoom(payload?.room, true);
    const message = this.normalizeMessage(payload?.message);

    return {
      room,
      senderId: client.data.user.id,
      senderUsername: client.data.user.username,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  private createSystemMessage(room: string, message: string): ChatRoomMessage {
    return {
      room,
      senderId: 'system',
      senderUsername: 'System',
      message,
      timestamp: new Date().toISOString(),
    };
  }

  private normalizeRoom(
    room: string | undefined,
    useGlobalDefault: boolean,
  ): string {
    const normalizedRoom = room?.trim();

    if (!normalizedRoom) {
      if (useGlobalDefault) {
        return GLOBAL_CHAT_ROOM;
      }

      throw new WsException('Room is required');
    }

    if (normalizedRoom.length > CHAT_ROOM_MAX_LENGTH) {
      throw new WsException(
        `Room must be ${CHAT_ROOM_MAX_LENGTH} characters or fewer`,
      );
    }

    if (!/^[A-Za-z0-9_-]+$/.test(normalizedRoom)) {
      throw new WsException(
        'Room can contain only letters, numbers, hyphens, and underscores',
      );
    }

    return normalizedRoom;
  }

  private normalizeMessage(message: string | undefined): string {
    const normalizedMessage = message?.trim();

    if (!normalizedMessage) {
      throw new WsException('Message is required');
    }

    if (normalizedMessage.length > CHAT_MESSAGE_MAX_LENGTH) {
      throw new WsException(
        `Message must be ${CHAT_MESSAGE_MAX_LENGTH} characters or fewer`,
      );
    }

    return normalizedMessage;
  }
}
