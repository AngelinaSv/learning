import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SecurityModule } from 'src/common/security/security.module';
import { AuthorizationModule } from 'src/common/authorization/authorization.module';
import { ProfileService } from './profile.service';

@Module({
  imports: [SecurityModule, AuthorizationModule],
  controllers: [UsersController],
  providers: [UsersService, ProfileService],
  exports: [UsersService, ProfileService],
})
export class UsersModule {}
