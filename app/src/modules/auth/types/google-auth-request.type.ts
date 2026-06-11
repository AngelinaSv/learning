import { Request } from 'express';
import { AuthResponse } from './auth-response.type';

export type GoogleAuthRequest = Request & {
  user: AuthResponse;
};
