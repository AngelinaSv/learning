import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AddressModule } from './modules/users/address/address.module';
import { ProfileModule } from './modules/users/profile/profile.module';
import { AdminModule } from './modules/admin/admin.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SessionsModule } from './modules/sessions/sessions.module';

@Module({
  imports: [UserModule, UsersModule, AuthModule, ProfilesModule, AddressesModule, AddressModule, ProfileModule, AdminModule, SessionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
