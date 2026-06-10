import { Socket } from 'socket.io';
import { WsAuthenticatedUser } from '../types/ws-authenticated-user.type';

export type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    user: WsAuthenticatedUser;
  };
};
