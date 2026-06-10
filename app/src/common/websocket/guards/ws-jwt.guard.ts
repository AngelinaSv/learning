import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DecodedJwtPayload } from 'src/modules/auth/strategies/jwt.strategy';
import { UsersService } from 'src/modules/users/users.service';
import { AuthenticatedSocket } from '../interfaces/authenticated-socket.interface';
import { WsAuthenticatedUser } from '../types/ws-authenticated-user.type';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    await this.authenticate(client);
    return true;
  }

  async authenticate(client: Socket): Promise<WsAuthenticatedUser> {
    const authenticatedClient = client as Socket & {
      data: Socket['data'] & { user?: WsAuthenticatedUser };
    };

    if (authenticatedClient.data.user) {
      return authenticatedClient.data.user;
    }

    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Missing WebSocket access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<DecodedJwtPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        },
      );

      const user = await this.usersService.findOne(payload.sub);

      if (user.isBanned || user.isDeleted) {
        throw new WsException('User is not allowed to connect');
      }

      authenticatedClient.data.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        isBanned: user.isBanned,
      };

      return authenticatedClient.data.user;
    } catch {
      throw new WsException('Invalid WebSocket access token');
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;
    const queryToken = client.handshake.query?.token;
    const authorization = client.handshake.headers.authorization;
    const token =
      typeof authToken === 'string'
        ? authToken
        : typeof queryToken === 'string'
          ? queryToken
          : authorization;

    return token?.replace(/^Bearer\s+/i, '').trim();
  }
}
