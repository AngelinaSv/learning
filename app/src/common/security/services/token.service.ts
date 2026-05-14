/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@generated/prisma/client';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  generate(userId: string, role: Role): string {
    const secret = this.configService.getOrThrow('ACCESS_TOKEN_SECRET');
    const expiresIn = parseInt(
      this.configService.getOrThrow('TOKEN_EXPIRES_IN'),
      10,
    );

    const payload = { sub: userId, role };

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }
}
