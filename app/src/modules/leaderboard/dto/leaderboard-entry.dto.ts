import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ example: 1 })
  rank!: number;

  @ApiProperty({ example: '6d16f4f8-8dd1-41c6-8e6c-e3a8080b9362' })
  userId!: string;

  @ApiProperty({ example: 'john_doe' })
  username!: string;

  @ApiProperty({ example: '1250.000000' })
  totalBets!: string;

  @ApiProperty({ example: '1485.500000' })
  totalWins!: string;

  @ApiProperty({ example: '235.500000' })
  netProfit!: string;

  @ApiProperty({ example: 42 })
  betCount!: number;

  @ApiProperty({ example: '2026-06-10T09:30:00.000Z', nullable: true })
  lastPlayedAt!: Date | null;
}
