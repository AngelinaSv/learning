import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { FIGHTING_HIT_ZONES } from '../../constants/fighting.constants';
import { FightingHitZone } from '../../types/fighting-battle.types';

export class FightingBattleMoveDto {
  @ApiProperty({ example: '8b59c4c3-8c8a-45e0-a37a-7fdc7c7f3c9e' })
  @IsString()
  playerId!: string;

  @ApiProperty({ enum: FIGHTING_HIT_ZONES, example: 'head' })
  @IsIn(FIGHTING_HIT_ZONES)
  attackZone!: FightingHitZone;

  @ApiProperty({ enum: FIGHTING_HIT_ZONES, example: 'body' })
  @IsIn(FIGHTING_HIT_ZONES)
  defenseZone!: FightingHitZone;

  @ApiProperty()
  @IsInt()
  healthBefore!: number;

  @ApiProperty()
  @IsInt()
  strike!: number;

  @ApiProperty()
  @IsInt()
  blockPower!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAuto?: boolean;

  @ApiProperty()
  @IsString()
  createdAt!: string;
}
