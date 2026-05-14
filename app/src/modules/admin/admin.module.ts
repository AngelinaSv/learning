import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { SecurityModule } from 'src/common/security/security.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SecurityModule, UsersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
