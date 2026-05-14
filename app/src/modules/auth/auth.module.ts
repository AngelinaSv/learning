import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport/dist/passport.module';
import { LocalStrategy } from './strategies/local.strategy';
// import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
// import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SecurityModule } from 'src/common/security/security.module';
import { AuthCookieService } from './auth-cookie.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    SecurityModule,
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
    //     signOptions: {
    //       expiresIn: configService.getOrThrow<string>(
    //         'TOKEN_EXPIRES_IN',
    //       ) as '15m',
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthCookieService],
})
export class AuthModule {}
