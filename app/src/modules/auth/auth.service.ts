import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { IUser } from 'src/common/types/types';
import { AddressService } from '../address/address.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly addressService: AddressService,
  ) {}
  // TODO:
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    const passwordIsMathc = await bcrypt.compare(pass, user?.password);

    if (user && passwordIsMathc) {
      return user;
    }

    throw new UnauthorizedException();
  }

  async create(createAuthDto: CreateAuthDto) {
    const existsUser = await this.usersService.findOneByEmail(
      createAuthDto.user.email,
    );

    if (existsUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const user = await this.usersService.create(createAuthDto.user);
    const address = await this.addressService.create(createAuthDto.address);

    const token = await this.login({ id: user.id, email: user.email });

    return {
      user: {
        ...user,
        address,
      },
      token,
    };
  }

  // TODO: use tokenService, sessionsService
  async login(user: IUser) {
    // const session = this.sessionService.create(user.id, data);

    return {
      id: user.id,
      email: user.email,
      access_token: this.jwtService.sign({ email: user.email, sub: user.id }),
      // sessionId,
    };
  }

  async logout(userId: number) {
    // await this.sessionService.remove(user.id, sessionId);
  }
}
