import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityModule } from 'src/common/security/security.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [UsersModule, PassportModule, SecurityModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
})
export class AuthModule {}
