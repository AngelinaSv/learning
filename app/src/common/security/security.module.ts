import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PasswordHashService } from './services/password-hash.service';
// import { TokenService } from './services/token.service';
import { TokenHashService } from './services/token-hash.service';

@Module({
  imports: [JwtModule.register({})],
  providers: [PasswordHashService, TokenHashService],
  exports: [PasswordHashService, TokenHashService],
})
export class SecurityModule {}
