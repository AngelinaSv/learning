import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { LeaderboardService } from './leaderboard.service';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Get leaderboard ranked by net profit',
    description:
      'Ranks users by total completed WIN transactions minus total completed BET transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns users ranked by net profit',
    type: LeaderboardResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() query: PaginationQueryDto) {
    return this.leaderboardService.findAll(query);
  }
}
