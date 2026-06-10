import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsString } from 'class-validator';
import {
  FIGHTING_HERO_IDS,
  FightingHeroId,
} from '../../constants/fighting-heroes.constants';
import { FightingRank } from '../../constants/fighting-ranks.constants';
import { FightingHeroResponseDto } from './fighting-hero-response.dto';

const FIGHTING_RANKS: FightingRank[] = [
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
];

export class FightingProfileResponseDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: FIGHTING_HERO_IDS })
  @IsIn(FIGHTING_HERO_IDS)
  selectedHero!: FightingHeroId;

  @ApiProperty({ type: () => FightingHeroResponseDto })
  @Type(() => FightingHeroResponseDto)
  hero!: FightingHeroResponseDto;

  @ApiProperty()
  @IsInt()
  rating!: number;

  @ApiProperty({ enum: FIGHTING_RANKS })
  @IsIn(FIGHTING_RANKS)
  rank!: FightingRank;

  @ApiProperty()
  @IsInt()
  wins!: number;

  @ApiProperty()
  @IsInt()
  losses!: number;

  @ApiProperty()
  @IsInt()
  draws!: number;

  @ApiProperty()
  @IsString()
  createdAt!: string;

  @ApiProperty()
  @IsString()
  updatedAt!: string;
}
