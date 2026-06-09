import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminUsersController } from './users-admin.controller';
import { ProfilesModule } from '../profiles/profiles.module';
import { SecurityModule } from 'src/common/security/security.module';

@Module({
  imports: [SecurityModule, ProfilesModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
