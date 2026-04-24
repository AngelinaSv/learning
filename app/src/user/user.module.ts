import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { StorageModule } from 'src/storage/storage.module';
import { AccessModule } from 'src/access/access.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), StorageModule, AccessModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
