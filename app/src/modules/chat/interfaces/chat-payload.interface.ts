export interface JoinRoomPayload {
  room: string;
}

export interface SendMessagePayload {
  room?: string;
  message: string;
}

export interface ChatRoomMessage {
  room: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
}

export interface ChatErrorEvent {
  status: 'error';
  event: string;
  message: string;
  timestamp: string;
}
