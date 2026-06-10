import { ApiProperty } from '@nestjs/swagger';
import { LeaderboardEntryDto } from './leaderboard-entry.dto';

class LeaderboardMetaDto {
  @ApiProperty({ example: 125 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 7 })
  lastPage!: number;
}

export class LeaderboardResponseDto {
  @ApiProperty({ type: () => [LeaderboardEntryDto] })
  data!: LeaderboardEntryDto[];

  @ApiProperty({ type: () => LeaderboardMetaDto })
  meta!: LeaderboardMetaDto;
}
