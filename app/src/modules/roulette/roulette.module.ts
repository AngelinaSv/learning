import { Module } from '@nestjs/common';
import { RouletteService } from './roulette.service';
import { RouletteController } from './roulette.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [RouletteController],
  providers: [RouletteService],
})
export class RouletteModule {}
