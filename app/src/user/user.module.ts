import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StorageModule } from 'src/storage/storage.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
