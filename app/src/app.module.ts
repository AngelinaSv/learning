import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { ViewsController } from './views.controller';
import { User } from './user/entities/user.entity';
import { File } from './file/entities/file.entity';
import { Role } from './access/role/entities/role.entity';
import { Permission } from './access/permission/entities/permisson.entity';
import { Session } from './auth/session/entities/session.entity';
import config from './common/config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/static',
      serveStaticOptions: {
        index: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        entities: [User, File, Role, Permission, Session],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    FileModule,
    AuthModule,
  ],
  controllers: [ViewsController],
  providers: [],
})
export class AppModule {}
