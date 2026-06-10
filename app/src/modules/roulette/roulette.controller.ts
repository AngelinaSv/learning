import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/common/security/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { Roles } from 'src/common/security/decorators/roles.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('Roulette')
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

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  history(@CurrentUserId() userId: string, @Query() query: PaginationQueryDto) {
    return this.rouletteService.getMyHistory(userId, query);
  }

  @Get('rating')
  @ApiOperation({ summary: 'Get roulette rating' })
  @ApiResponse({ status: 200, description: 'Returns rating' })
  rating() {
    return this.rouletteService.getRating();
  }
}
