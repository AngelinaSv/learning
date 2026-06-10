import { Module } from '@nestjs/common';
import { CommonWebsocketModule } from 'src/common/websocket';
import { RedisModule } from 'src/core/redis/redis.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { FightingBattlesController } from './controllers/fighting-battles.controller';
import { FightingDuelRequestsController } from './controllers/fighting-duel-requests.controller';
import { FightingProfilesController } from './controllers/fighting-profiles.controller';
import { FightingBattlesGateway } from './gateways/fighting-battles.gateway';
import { FightingBattlesService } from './services/fighting-battles.service';
import { FightingDuelRequestsService } from './services/fighting-duel-requests.service';
import { FightingMatchmakingService } from './services/fighting-matchmaking.service';
import { FightingProfilesService } from './services/fighting-profiles.service';

@Module({
  imports: [CommonWebsocketModule, PrismaModule, RedisModule],
  controllers: [
    FightingDuelRequestsController,
    FightingBattlesController,
    FightingProfilesController,
  ],
  providers: [
    FightingBattlesGateway,
    FightingBattlesService,
    FightingDuelRequestsService,
    FightingMatchmakingService,
    FightingProfilesService,
  ],
  exports: [
    FightingBattlesService,
    FightingDuelRequestsService,
    FightingMatchmakingService,
    FightingProfilesService,
  ],
})
export class FightingModule {}
