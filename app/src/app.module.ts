import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { ViewsController } from './views.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: false,
      },
    }),
    UserModule,
    FileModule,
    AuthModule,
    StorageModule,
  ],
  controllers: [ViewsController],
  providers: [],
})
export class AppModule {}
