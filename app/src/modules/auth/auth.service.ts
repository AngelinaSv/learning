import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { IUser } from 'src/common/types/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
      createAuthDto.email,
    );

    if (existsUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const user = await this.usersService.create(createAuthDto);
    const token = await this.login({ id: user.id, email: user.email });

    return { user, token };
  }

  async login(user: IUser) {
    const { email, id } = user;
    return {
      id,
      email,
      access_token: this.jwtService.sign({ email, sub: id }),
    };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
