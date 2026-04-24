import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { SignInDto, SignUpDto, AuthTokenDto } from './dto';
import { SessionService } from './session/session.service';
import { JwtPayload } from './types/jwtPayload';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private sessionService: SessionService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<AuthTokenDto> {
    const { email, password, firstName, lastName } = signUpDto;

    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create({
      email,
      password,
      firstName,
      lastName,
    });

    const tokens = this.generateTokens(user);

    await this.sessionService.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async signIn(signInDto: SignInDto): Promise<AuthTokenDto> {
    const { email, password } = signInDto;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const storedPwd = user.password;
    const inputPwd = password;

    console.log('Comparing:');
    console.log('  Input length:', inputPwd.length);
    console.log('  Stored length:', storedPwd.length);
    console.log('  Stored raw:', storedPwd);

    const hash1 = storedPwd;
    const isValid = await bcrypt.compare(inputPwd, hash1);
    console.log('  bcrypt result:', isValid);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);
    await this.sessionService.createSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async refresh(userId: string): Promise<AuthTokenDto> {
    const session = await this.sessionService.findById(userId);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = this.generateTokens(user);
    await this.updateRefreshToken(userId, tokens.refreshToken);

    return tokens;
  }

  async signOut(userId: string): Promise<{ success: boolean }> {
    await this.sessionService.deleteSession(userId);
    return { success: true };
  }

  async validateUser(payload: {
    email: string;
    password: string;
  }): Promise<User> {
    const user = await this.userService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async updateRefreshToken(
    userId: string,
    newRefreshToken: string,
  ): Promise<void> {
    await this.sessionService.rotateRefreshToken(userId, newRefreshToken);
  }

  private generateTokens(user: User): AuthTokenDto {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: 900,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: 604800,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }
}
