import { PartialType } from '@nestjs/mapped-types';
import { CreateRouletteDto } from './spin-roulette.dto';

export class UpdateRouletteDto extends PartialType(CreateRouletteDto) {}
