import { Module } from '@nestjs/common';
import { RedisModule } from 'src/core/redis/redis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletModule } from '../wallet/wallet.module';
import { VideoSlotAdminController } from './video-slot-admin.controller';
import { VideoSlotController } from './video-slot.controller';
import { VideoSlotMathService } from './video-slot-math.service';
import { VideoSlotService } from './video-slot.service';

@Module({
  imports: [PrismaModule, RedisModule, WalletModule],
  controllers: [VideoSlotController, VideoSlotAdminController],
  providers: [VideoSlotService, VideoSlotMathService],
  exports: [VideoSlotService],
})
export class VideoSlotModule {}
