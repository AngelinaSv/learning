import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AdminModule } from './modules/admin/admin.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { RouletteModule } from './modules/roulette/roulette.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RedisModule } from './core/redis/redis.module';
import { ChatModule } from './modules/chat/chat.module';
import { VideoSlotModule } from './modules/video-slot/video-slot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    AdminModule,
    SessionsModule,
    RouletteModule,
    PrismaModule,
    AddressesModule,
    ProfilesModule,
    WalletModule,
    RedisModule.forRootAsync(),
    ChatModule,
    VideoSlotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
