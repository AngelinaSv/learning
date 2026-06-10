import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayVideoSlotDto } from './dto/play-video-slot.dto';
import { StartVideoSlotDto } from './dto/start-video-slot.dto';
import { VideoSlotService } from './video-slot.service';

@ApiTags('Video Slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('video-slots')
export class VideoSlotController {
  constructor(private readonly videoSlotService: VideoSlotService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new video slot session' })
  @ApiResponse({ status: 201, description: 'Video slot session started' })
  @ApiResponse({ status: 409, description: 'Active session already exists' })
  createSession(
    @CurrentUserId() userId: string,
    @Body() dto: StartVideoSlotDto,
  ) {
    return this.videoSlotService.initializeGameSession(userId, dto);
  }

  @Get('sessions/current')
  @ApiOperation({ summary: 'Get current video slot session' })
  @ApiResponse({ status: 200, description: 'Returns current active session' })
  @ApiResponse({ status: 400, description: 'Active session not found' })
  getMySession(@CurrentUserId() userId: string) {
    return this.videoSlotService.getCurrentSession(userId);
  }

  @Post('sessions/:id/spins')
  @ApiOperation({ summary: 'Create a video slot spin in a session' })
  @ApiParam({
    name: 'id',
    description: 'Video slot session ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 201, description: 'Video slot spin result' })
  @ApiResponse({ status: 400, description: 'Invalid session, bet, or lines' })
  spin(
    @CurrentUserId() userId: string,
    @Param('id') sessionId: string,
    @Body() dto: PlayVideoSlotDto,
  ) {
    return this.videoSlotService.play(userId, sessionId, dto);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Finish a video slot session' })
  @ApiParam({
    name: 'id',
    description: 'Video slot session ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, description: 'Video slot session ended' })
  @ApiResponse({ status: 400, description: 'Invalid or mismatched session' })
  finishSession(
    @CurrentUserId() userId: string,
    @Param('id') sessionId: string,
  ) {
    return this.videoSlotService.endGame(userId, sessionId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get video slot history' })
  @ApiResponse({ status: 200, description: 'Returns video slot history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  history(@CurrentUserId() userId: string, @Query() query: PaginationQueryDto) {
    return this.videoSlotService.getMyHistory(userId, query);
  }
}
