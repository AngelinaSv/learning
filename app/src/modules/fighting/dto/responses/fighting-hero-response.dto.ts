import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString } from 'class-validator';
import {
  FIGHTING_HERO_IDS,
  FightingHeroId,
} from '../../constants/fighting-heroes.constants';

export class FightingHeroResponseDto {
  @ApiProperty({ enum: FIGHTING_HERO_IDS })
  @IsIn(FIGHTING_HERO_IDS)
  id!: FightingHeroId;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsInt()
  maxHealth!: number;

  @ApiProperty()
  @IsInt()
  strike!: number;

  @ApiProperty()
  @IsInt()
  blockPower!: number;
}
