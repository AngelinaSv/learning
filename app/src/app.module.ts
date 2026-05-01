import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressModule } from './modules/address/address.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RouletteModule } from './modules/roulette/roulette.module';
import { SessionsModule } from './modules/sessions/sessions.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    AddressModule,
    AdminModule,
    SessionsModule,
    RouletteModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
