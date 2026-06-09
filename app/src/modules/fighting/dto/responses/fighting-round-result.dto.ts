import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import { FightingBattleMoveDto } from './fighting-battle-move.dto';

export class FightingRoundResultDto {
  @ApiProperty()
  @IsInt()
  round!: number;

  @ApiProperty({ type: () => FightingBattleMoveDto })
  @Type(() => FightingBattleMoveDto)
  player1Move!: FightingBattleMoveDto;

  @ApiProperty({ type: () => FightingBattleMoveDto })
  @Type(() => FightingBattleMoveDto)
  player2Move!: FightingBattleMoveDto;

  @ApiProperty()
  @IsInt()
  player1DamageTaken!: number;

  @ApiProperty()
  @IsInt()
  player2DamageTaken!: number;

  @ApiProperty()
  @IsInt()
  player1HealthAfter!: number;

  @ApiProperty()
  @IsInt()
  player2HealthAfter!: number;
}
