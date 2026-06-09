import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthCookieService {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookie(res: Response, token: string) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    const maxAge =
      parseInt(this.configService.getOrThrow('TOKEN_EXPIRES_IN'), 10) * 1000;

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge,
    });
  }

  clearAuthCookie(res: Response) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
    });
  }
}
