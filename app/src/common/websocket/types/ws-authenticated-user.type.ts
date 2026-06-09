import { Role } from '@generated/prisma/client';

export type WsAuthenticatedUser = {
  id: string;
  username: string;
  role: Role;
  isBanned: boolean;
};
