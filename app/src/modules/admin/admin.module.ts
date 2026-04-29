import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthorizationModule } from 'src/common/authorization/authorization.module';

@Module({
  imports: [AuthorizationModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
