import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { RouletteService } from './roulette.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { SpinRouletteDto } from './dto/spin-roulette.dto';

@UseGuards(JwtAuthGuard)
@Controller('roulette')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post('sessions')
  createSession(@CurrentUserId() userId: string) {
    return this.rouletteService.createSession(userId);
  }

  @Get('sessions')
  getAllSessions(@CurrentUserId() userId: string) {
    return this.rouletteService.findAllSessions(userId);
  }

  @Get('sessions/current')
  getMySession(@CurrentUserId() userId: string) {
    return this.rouletteService.getCurrentSession(userId);
  }

  @Post('sessions/:id/finish')
  finishSession(
    @CurrentUserId() userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.rouletteService.finishSession(userId, sessionId);
  }

  @Post('spin')
  spin(@CurrentUserId() userId: string, @Body() dto: SpinRouletteDto) {
    return this.rouletteService.spin(userId, dto);
  }

  @Get('history')
  history(@CurrentUserId() userId: string) {
    return this.rouletteService.getMyHistory(userId);
  }

  @Get('rating')
  rating() {
    return this.rouletteService.getRating();
  }
}
