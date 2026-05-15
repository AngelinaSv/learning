import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { SignInDto } from './dto/sign-in.dto';
import { AuthCookieService } from './auth-cookie.service';
import type { Response } from 'express';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('sign-up')
  async register(@Body() body: SignUpDto) {
    return this.authService.create(body);
  }

  @Post('sign-in')
  async login(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loggedUser = await this.authService.login(body);
    this.authCookieService.setAuthCookie(res, loggedUser.accessToken);

    return loggedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  async logout(
    @CurrentUserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const logoutMessage = await this.authService.logout(userId);
    this.authCookieService.clearAuthCookie(res);

    return logoutMessage;
  }
}
