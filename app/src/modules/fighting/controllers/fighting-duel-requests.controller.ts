import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateFightingDuelRequestDto } from '../dto/create-fighting-duel-request.dto';
import { FightingDuelRequestsService } from '../services/fighting-duel-requests.service';

@ApiTags('fighting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fighting/duel-requests')
export class FightingDuelRequestsController {
  constructor(
    private readonly fightingDuelRequestsService: FightingDuelRequestsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a fighting duel request' })
  @ApiBody({
    type: CreateFightingDuelRequestDto,
    required: false,
    examples: {
      open: { value: {} },
      targeted: {
        value: { opponentId: '8b59c4c3-8c8a-45e0-a37a-7fdc7c7f3c9e' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Duel request created in Redis' })
  @ApiResponse({ status: 400, description: 'Invalid duel request' })
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateFightingDuelRequestDto,
  ) {
    return this.fightingDuelRequestsService.create(userId, dto ?? {});
  }

  @Get()
  @ApiOperation({ summary: 'List open fighting duel requests' })
  @ApiResponse({
    status: 200,
    description: 'Pending duel requests visible to the current user',
  })
  findPending(@CurrentUserId() userId: string) {
    return this.fightingDuelRequestsService.findPending(userId);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a fighting duel request' })
  @ApiParam({ name: 'id', description: 'Fighting duel request ID' })
  @ApiResponse({
    status: 201,
    description: 'Duel request accepted and battle room created',
  })
  @ApiResponse({ status: 404, description: 'Duel request not found' })
  @ApiResponse({ status: 409, description: 'Duel request is not pending' })
  accept(@CurrentUserId() userId: string, @Param('id') requestId: string) {
    return this.fightingDuelRequestsService.accept(requestId, userId);
  }
}
