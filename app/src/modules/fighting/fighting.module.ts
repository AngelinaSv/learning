import { Module } from '@nestjs/common';
import { CommonWebsocketModule } from 'src/common/websocket';
import { RedisModule } from 'src/core/redis/redis.module';
import { FightingBattlesController } from './controllers/fighting-battles.controller';
import { FightingDuelRequestsController } from './controllers/fighting-duel-requests.controller';
import { FightingBattlesGateway } from './gateways/fighting-battles.gateway';
import { FightingBattlesService } from './services/fighting-battles.service';
import { FightingDuelRequestsService } from './services/fighting-duel-requests.service';

@Module({
  imports: [CommonWebsocketModule, RedisModule],
  controllers: [FightingDuelRequestsController, FightingBattlesController],
  providers: [
    FightingBattlesGateway,
    FightingBattlesService,
    FightingDuelRequestsService,
  ],
  exports: [FightingBattlesService, FightingDuelRequestsService],
})
export class FightingModule {}
