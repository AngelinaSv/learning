import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class FightingPlayerBattleStatsDto {
  @ApiProperty()
  @IsInt()
  maxHealth!: number;

  @ApiProperty()
  @IsInt()
  strike!: number;

  @ApiProperty()
  @IsInt()
  blockPower!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  heroId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  heroName?: string;
}
