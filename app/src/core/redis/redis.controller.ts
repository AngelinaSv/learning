import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RedisService } from './redis.service';

@ApiTags('redis')
@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verify Redis read/write connectivity' })
  @ApiResponse({ status: 200, description: 'Redis is available' })
  async health() {
    return this.redisService.healthCheck();
  }
}
