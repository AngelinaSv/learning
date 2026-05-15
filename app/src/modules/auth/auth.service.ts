import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
// import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { TokenService } from 'src/common/security/services/token.service';
import { SignUpDto } from './dto/sign-up.dto';
import { PasswordHashService } from 'src/common/security/services/password-hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    // private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
    private readonly passwordHashService: PasswordHashService,
  ) {}
  // TODO:
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    const passwordIsMathc = await bcrypt.compare(pass, user!.password);

    if (!user || !passwordIsMathc) {
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
    // const session = this.sessionService.create(user.id, data);
    const user = await this.usersService.findOneByEmail(email);

    const passwordIsMathc = await this.passwordHashService.compare(
      password,
      user!.password,
    );

    if (!user || !passwordIsMathc) {
      throw new UnauthorizedException();
    }

    if (user.isBanned) {
      throw new ForbiddenException();
    }

    const accessToken = this.tokenService.generate(user.id, user.role);

    return {
      user,
      accessToken,
      // access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
      // sessionId,
    };
  }

  async logout(userId: string) {
    // await this.sessionService.remove(user.id, sessionId);
    return { message: 'Signout success' };
  }
}
