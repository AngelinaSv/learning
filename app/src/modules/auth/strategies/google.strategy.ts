import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { GoogleProfileData } from '../types/google-profile-data.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        return done(
          new UnauthorizedException('Google profile email is missing'),
          false,
        );
      }

      const profileData: GoogleProfileData = {
        email,
        displayName: profile.displayName,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
      };
      const authResponse =
        await this.authService.validateGoogleUser(profileData);

      return done(null, authResponse);
    } catch (error) {
      return done(error as Error, false);
    }
  }
}
