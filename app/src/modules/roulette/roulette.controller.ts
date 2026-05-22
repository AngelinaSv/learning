import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { RouletteService } from './roulette.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { SpinRouletteDto } from './dto/spin-roulette.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('roulette')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roulette')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new roulette session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  createSession(@CurrentUserId() userId: string) {
    return this.rouletteService.createSession(userId);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all roulette sessions' })
  @ApiResponse({ status: 200, description: 'Returns all sessions' })
  getAllSessions(@CurrentUserId() userId: string) {
    return this.rouletteService.findAllSessions(userId);
  }

  @Get('sessions/current')
  @ApiOperation({ summary: 'Get current roulette session' })
  @ApiResponse({ status: 200, description: 'Returns current session' })
  getMySession(@CurrentUserId() userId: string) {
    return this.rouletteService.getCurrentSession(userId);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Finish a roulette session' })
  @ApiResponse({ status: 200, description: 'Session finished' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  finishSession(
    @CurrentUserId() userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.rouletteService.finishSession(userId, sessionId);
  }

  @Post('spin')
  @ApiOperation({ summary: 'Spin the roulette' })
  @ApiResponse({ status: 201, description: 'Spin result' })
  spin(@CurrentUserId() userId: string, @Body() dto: SpinRouletteDto) {
    return this.rouletteService.spin(userId, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get roulette history' })
  @ApiResponse({ status: 200, description: 'Returns roulette history' })
  history(@CurrentUserId() userId: string) {
    return this.rouletteService.getMyHistory(userId);
  }

  @Get('rating')
  @ApiOperation({ summary: 'Get roulette rating' })
  @ApiResponse({ status: 200, description: 'Returns rating' })
  rating() {
    return this.rouletteService.getRating();
  }
}
