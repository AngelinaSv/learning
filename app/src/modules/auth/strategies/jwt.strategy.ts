import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { SessionsService } from 'src/modules/sessions/sessions.service';
import { UsersService } from 'src/modules/users/users.service';

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
  constructor(
    private readonly configService: ConfigService,
    // private readonly sessionService: SessionsService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: DecodedJwtPayload) {
    const { sub: userId, sessionId } = payload;
    // const sessionExists = await this.sessionService.checkSession(
    //   sessionId,
    //   userId,
    // );

    // if (!sessionExists) {
    //   throw new UnauthorizedException();
    // }

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.isBanned) {
      throw new ForbiddenException();
    }

    return {
      id: user.id,
      role: user.role,
      // sessionId,
      isBanned: user.isBanned,
    };
  }
}
