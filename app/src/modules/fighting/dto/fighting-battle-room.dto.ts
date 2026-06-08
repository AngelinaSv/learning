import { ApiProperty } from '@nestjs/swagger';

export class FightingBattleStatusDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: ['active', 'finished'] })
  status!: string;

  @ApiProperty()
  player1Id!: string;

  @ApiProperty()
  player2Id!: string;

  @ApiProperty()
  currentRound!: number;

  @ApiProperty()
  player1Health!: number;

  @ApiProperty()
  player2Health!: number;

  @ApiProperty({ required: false })
  winnerId?: string;

  @ApiProperty({ required: false })
  lastRoundResult?: unknown;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
