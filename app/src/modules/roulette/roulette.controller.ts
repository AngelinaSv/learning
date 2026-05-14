import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RouletteService } from './roulette.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { SpinRouletteDto } from './dto/spin-roulette.dto';

@UseGuards(JwtAuthGuard)
@Controller('roulette')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post('session')
  createSession(@CurrentUserId() userId: string) {
    return this.rouletteService.createSession(userId);
  }

  @Get('session')
  getMySession(@CurrentUserId() userId: string) {
    return this.rouletteService.getCurrentSession(userId);
  }

  @Post('spin')
  spin(@CurrentUserId() userId: string, @Body() dto: SpinRouletteDto) {
    return this.rouletteService.spin(userId, dto);
  }
}
