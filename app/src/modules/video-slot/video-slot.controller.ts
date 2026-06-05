import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlayVideoSlotDto } from './dto/play-video-slot.dto';
import { VideoSlotService } from './video-slot.service';

@ApiTags('video-slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('video-slots')
export class VideoSlotController {
  constructor(private readonly videoSlotService: VideoSlotService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new video slot session' })
  @ApiResponse({ status: 201, description: 'Video slot session started' })
  @ApiResponse({ status: 409, description: 'Active session already exists' })
  createSession(@CurrentUserId() userId: string) {
    return this.videoSlotService.initializeGameSession(userId);
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
  @ApiBody({
    type: PlayVideoSlotDto,
    examples: {
      default: { value: { bet: 10, lines: [1, 2, 3, 4, 5] } },
      allLines: {
        value: {
          bet: 150,
          lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
      },
    },
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
  history(@CurrentUserId() userId: string) {
    return this.videoSlotService.getMyHistory(userId);
  }
}
