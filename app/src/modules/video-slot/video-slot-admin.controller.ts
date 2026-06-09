import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/security/decorators/roles.decorator';
import { RolesGuard } from 'src/common/security/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { PAYLINES_CONFIG } from './constants/video-slot.constants';
import { SimulateRtpDto } from './dto/simulate-rtp.dto';
import { VideoSlotMathService } from './video-slot-math.service';

@ApiTags('admin/video-slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/video-slots')
export class VideoSlotAdminController {
  constructor(private readonly mathService: VideoSlotMathService) {}

  @Post('simulate-rtp')
  @ApiOperation({ summary: 'Simulate video slot RTP' })
  @ApiBody({
    type: SimulateRtpDto,
    examples: {
      default: {
        value: {
          spins: 100000,
          bet: 100,
          lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
          mode: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'RTP simulation result' })
  simulateRtp(@Body() dto: SimulateRtpDto) {
    const lines = dto.lines ?? PAYLINES_CONFIG.map((line) => line.id);

    return this.mathService.simulateRtp(
      dto.spins ?? 100000,
      dto.bet ?? 100,
      lines,
      dto.mode ?? 1,
    );
  }
}
