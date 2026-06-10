import { io, type Socket } from 'socket.io-client';
import { CHAT_WS_URL } from '../lib/api';
import { createClientId } from '../lib/id';

export interface GlobalChatMessage {
  id: string;
  room: string;
  senderId?: string;
  senderUsername?: string;
  message: string;
  timestamp: string;
  system?: boolean;
}

export type GlobalChatStatus = 'connecting' | 'connected' | 'disconnected';

export interface GlobalChatState {
  messages: GlobalChatMessage[];
  status: GlobalChatStatus;
  error: string;
}

type ChatListener = (state: GlobalChatState) => void;

let socket: Socket | null = null;
let socketToken: string | null = null;
let state: GlobalChatState = {
  messages: [],
  status: 'disconnected',
  error: '',
};

const listeners = new Set<ChatListener>();

function isSystemChatMessage(message: Omit<GlobalChatMessage, 'id'> | GlobalChatMessage) {
  return (
    message.system ||
    !message.senderId ||
    message.senderId === 'system' ||
    message.senderUsername?.toLowerCase() === 'system'
  );
}

function updateState(nextState: Partial<GlobalChatState>) {
  state = {
    ...state,
    ...nextState,
    messages: nextState.messages ? nextState.messages.filter((message) => !isSystemChatMessage(message)) : state.messages,
  };
  listeners.forEach((listener) => listener(state));
}

function addMessage(message: Omit<GlobalChatMessage, 'id'>) {
  if (isSystemChatMessage(message)) return;

  updateState({
    messages: [...state.messages, { ...message, id: createClientId() }],
  });
}

function createSocket(token: string) {
  const nextSocket = io(CHAT_WS_URL, {
    auth: { token },
    extraHeaders: { Authorization: `Bearer ${token}` },
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 900,
  });

  nextSocket.on('connect', () => {
    updateState({ status: 'connected', error: '' });
    nextSocket.emit('joinRoom', { room: 'global' });
  });

  nextSocket.on('disconnect', () => updateState({ status: 'disconnected' }));
  nextSocket.on('connect_error', (err) => {
    console.error('Global chat socket connect_error', {
      message: err.message,
      url: CHAT_WS_URL,
    });
    updateState({
      status: 'disconnected',
      error: err.message || 'Unable to connect to chat.',
    });
  });
  nextSocket.on('roomMessage', (message: Omit<GlobalChatMessage, 'id'>) => addMessage(message));
  nextSocket.on('chatError', (payload) => updateState({ error: payload?.message || 'Chat error.' }));
  nextSocket.on('chat:message:blocked', (payload) => updateState({ error: payload?.reason || 'Message blocked.' }));

  return nextSocket;
}

export function getGlobalChatState() {
  return state;
}

export function subscribeGlobalChat(listener: ChatListener) {
  listeners.add(listener);
  listener(state);

  return () => {
    listeners.delete(listener);
  };
}

export function connectGlobalChat(token: string | null) {
  if (!token) {
    disconnectGlobalChat();
    updateState({
      status: 'disconnected',
      error: 'Sign in to connect to global chat.',
    });
    return;
  }

  if (socket && socketToken === token) {
    return;
  }

  disconnectGlobalChat({ keepMessages: true });
  socketToken = token;
  updateState({ status: 'connecting', error: '' });
  socket = createSocket(token);
}

export function disconnectGlobalChat(options: { keepMessages?: boolean } = {}) {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socketToken = null;
  updateState({
    status: 'disconnected',
    error: '',
    messages: options.keepMessages ? state.messages : [],
  });
}

export function sendGlobalChatMessage(message: string) {
  const trimmedMessage = message.trim();

  if (!trimmedMessage || state.status !== 'connected') return;

  socket?.emit('sendMessage', { room: 'global', message: trimmedMessage }, (response: { status?: string; reason?: string }) => {
    if (response?.status === 'blocked') {
      updateState({ error: response.reason || 'Message blocked.' });
    }
  });
}
