import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/security/decorators/roles.decorator';
import { RolesGuard } from 'src/common/security/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { SimulateRtpDto } from './dto/simulate-rtp.dto';
import { VideoSlotMathService } from './video-slot-math.service';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/video-slots')
export class VideoSlotAdminController {
  constructor(private readonly mathService: VideoSlotMathService) {}

  @Post('simulate-rtp')
  @ApiOperation({ summary: 'Simulate video slot RTP' })
  @ApiResponse({ status: 201, description: 'RTP simulation result' })
  simulateRtp(@Body() dto: SimulateRtpDto) {
    const { spins, bet, lines, mode } = dto;

    return this.mathService.simulateRtp(spins, bet, lines, mode);
  }
}
