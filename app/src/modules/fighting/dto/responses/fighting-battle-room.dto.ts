import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { FightingStatus } from '../../enums/status.enum';
import { FightingBattleResult } from '../../types/fighting-battle.types';
import { FightingPlayerBattleStatsDto } from './fighting-player-battle-stats.dto';
import { FightingRoundResultDto } from './fighting-round-result.dto';

const FIGHTING_BATTLE_RESULTS: FightingBattleResult[] = [
  'PLAYER1_WIN',
  'PLAYER2_WIN',
  'DRAW',
];

export class FightingBattleRoomDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ enum: FightingStatus })
  @IsEnum(FightingStatus)
  status!: string;

  @ApiProperty()
  @IsString()
  player1Id!: string;

  @ApiProperty()
  @IsString()
  player2Id!: string;

  @ApiProperty()
  @IsInt()
  currentRound!: number;

  @ApiProperty()
  @IsInt()
  player1Health!: number;

  @ApiProperty()
  @IsInt()
  player2Health!: number;

  @ApiProperty({ type: () => FightingPlayerBattleStatsDto })
  @Type(() => FightingPlayerBattleStatsDto)
  player1Stats!: FightingPlayerBattleStatsDto;

  @ApiProperty({ type: () => FightingPlayerBattleStatsDto })
  @Type(() => FightingPlayerBattleStatsDto)
  player2Stats!: FightingPlayerBattleStatsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  winnerId?: string;

  @ApiProperty({ enum: FIGHTING_BATTLE_RESULTS, nullable: true })
  @IsOptional()
  @IsIn(FIGHTING_BATTLE_RESULTS)
  result!: FightingBattleResult | null;

  @ApiPropertyOptional({
    type: () => FightingRoundResultDto,
  })
  @IsOptional()
  @Type(() => FightingRoundResultDto)
  lastRoundResult?: FightingRoundResultDto;

  @ApiProperty({
    type: () => FightingRoundResultDto,
    isArray: true,
  })
  @Type(() => FightingRoundResultDto)
  roundResults!: FightingRoundResultDto[];

  @ApiProperty()
  @IsString()
  createdAt!: string;

  @ApiProperty()
  @IsString()
  updatedAt!: string;
}
