import { Injectable, UnauthorizedException } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { User } from 'src/user/types/user.type';

interface AuthDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private storage: StorageService) {}

  async validateUser(authDto: AuthDto): Promise<User> {
    const { email, password } = authDto;
    const users = await this.storage.readUsers();

    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
