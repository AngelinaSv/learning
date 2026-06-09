import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@generated/prisma/client';
import { UsersService } from 'src/modules/users/users.service';

export type JwtPayload = {
  sub: string;
  role: Role;
};

export type DecodedJwtPayload = JwtPayload & {
  iat: number;
  exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: DecodedJwtPayload) {
    const { sub: userId } = payload;
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
      isBanned: user.isBanned,
    };
  }
}
