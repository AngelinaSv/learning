import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import {
  FIGHTING_HERO_IDS,
  FightingHeroId,
} from '../constants/fighting-heroes.constants';

export class SelectFightingHeroDto {
  @ApiProperty({
    enum: FIGHTING_HERO_IDS,
    example: 'NEON_SAMURAI',
  })
  @IsIn(FIGHTING_HERO_IDS)
  heroId!: FightingHeroId;
}
