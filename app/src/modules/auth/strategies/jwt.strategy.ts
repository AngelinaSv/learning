import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DbToRole } from 'src/modules/users/mappers/user-role.mapper';

export type JwtPayload = {
  sub: string;
  email: string;
  username: string;
  sessionId: string;
};

export type DecodedJwtPayload = JwtPayload & {
  iat: number;
  exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: DecodedJwtPayload) {
    const { sub: userId, sessionId } = payload;

    const sessionExists = await this.sessionService.checkSession(
      sessionId,
      userId,
    );

    if (!sessionExists) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException();
    }

    return {
      id: user.id,
      role: DbToRole[user.role],
      sessionId,
    };
  }
}
