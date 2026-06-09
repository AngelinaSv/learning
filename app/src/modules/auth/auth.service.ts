import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from 'src/common/security/services/token.service';
import { SignUpDto } from './dto/sign-up.dto';
import { PasswordHashService } from 'src/common/security/services/password-hash.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordHashService: PasswordHashService,
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

  logout() {
    return { message: 'Signout success' };
  }
}
