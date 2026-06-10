import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { GoogleAuthRequest } from './types/google-auth-request.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async register(@Body() body: SignUpDto) {
    return this.authService.create(body);
  }

  @Post('sign-in')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  async login(@Body() body: SignInDto) {
    const loggedUser = await this.authService.login(body);

    return loggedUser;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login' })
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  googleCallback(@Req() req: GoogleAuthRequest, @Res() res: Response) {
    return res.redirect(
      this.authService.getGoogleFrontendRedirectUrl(req.user.accessToken),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  logout() {
    const logoutMessage = this.authService.logout();

    return logoutMessage;
  }
}
