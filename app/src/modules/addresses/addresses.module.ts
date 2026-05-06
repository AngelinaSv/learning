import { Module } from '@nestjs/common';
import { AddressesService } from './addresseses.service';
import { AddressesController } from './addresses.controller';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
