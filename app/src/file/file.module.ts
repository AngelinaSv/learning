import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { UserModule } from 'src/user/user.module';
import { StorageModule } from 'src/storage/storage.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UserModule, StorageModule, AuthModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
