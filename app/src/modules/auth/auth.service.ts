import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from 'src/common/security/services/token.service';
import { SignUpDto } from './dto/sign-up.dto';
import { PasswordHashService } from 'src/common/security/services/password-hash.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { User } from '@generated/prisma/client';
import { AuthResponse } from './types/auth-response.type';
import { GoogleProfileData } from './types/google-profile-data.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordHashService: PasswordHashService,
    private readonly configService: ConfigService,
  ) {}
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordIsMathc = await this.passwordHashService.compare(
      pass,
      user.password,
    );

    if (!passwordIsMathc) {
      throw new UnauthorizedException();
    }

    if (user.isBanned) {
      throw new ForbiddenException();
    }

    return user;
  }

  async create(data: SignUpDto) {
    const existsUser = await this.usersService.findOneByEmail(data.email);

    if (existsUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHashService.hash(data.password);

    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    return {
      user,
    };
  }

  async login(data: SignInDto) {
    const { email, password } = data;
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordIsMathc = await this.passwordHashService.compare(
      password,
      user.password,
    );

    if (!passwordIsMathc) {
      throw new UnauthorizedException();
    }

    if (user.isBanned) {
      throw new ForbiddenException();
    }

    const accessToken = this.tokenService.generate(user.id, user.role);

    return {
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
      accessToken,
    };
  }

  async validateGoogleUser(
    profileData: GoogleProfileData,
  ): Promise<AuthResponse> {
    let user = await this.usersService.findOneByEmail(profileData.email);

    if (!user) {
      const password = await this.passwordHashService.hash(randomUUID());

      user = await this.usersService.createOAuthUser({
        email: profileData.email,
        password,
        username: this.getGoogleUsername(profileData),
        avatar: profileData.avatar,
      });
    }

    if (user.isBanned) {
      throw new ForbiddenException();
    }

    return this.buildAuthResponse(user);
  }

  getGoogleFrontendRedirectUrl(accessToken: string): string {
    const redirectTarget =
      this.configService.get<string>('GOOGLE_FRONTEND_REDIRECT_URL') ??
      `${this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173'}/auth/google/callback`;
    const redirectUrl = new URL(redirectTarget);

    redirectUrl.searchParams.set('accessToken', accessToken);

    return redirectUrl.toString();
  }

  logout() {
    return { message: 'Signout success' };
  }

  private getGoogleUsername(profileData: GoogleProfileData): string {
    const source =
      profileData.displayName ||
      profileData.email.split('@')[0] ||
      `google_${profileData.googleId}`;
    const username = source
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 24);

    return username || `user_${randomUUID().slice(0, 8)}`;
  }

  private buildAuthResponse(user: User): AuthResponse {
    return {
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
      accessToken: this.tokenService.generate(user.id, user.role),
    };
  }
}
