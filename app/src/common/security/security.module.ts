import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PasswordHashService } from './services/password-hash.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [PasswordHashService, TokenService],
  exports: [PasswordHashService, TokenService],
})
export class SecurityModule {}
