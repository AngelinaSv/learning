import { Module } from '@nestjs/common';
import { RolesGuard } from './guards/roles.guard';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class AuthorizationModule {}
