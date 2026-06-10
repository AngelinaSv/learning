import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateFightingDuelRequestDto } from '../dto/requests/create-fighting-duel-request.dto';
import { FightingDuelAcceptResponseDto } from '../dto/responses/fighting-duel-accept-response.dto';
import { FightingDuelRequestResponseDto } from '../dto/responses/fighting-duel-request-response.dto';
import { FightingResponseMapper } from '../mappers/fighting-response.mapper';
import { FightingDuelRequestsService } from '../services/fighting-duel-requests.service';

@ApiTags('Fighting')
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
  })
  @ApiCreatedResponse({
    description: 'Duel request created in Redis',
    type: FightingDuelRequestResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid duel request' })
  async create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateFightingDuelRequestDto,
  ): Promise<FightingDuelRequestResponseDto> {
    const request = await this.fightingDuelRequestsService.create(
      userId,
      dto ?? {},
    );

    return FightingResponseMapper.toDuelRequestResponseDto(request);
  }

  @Get()
  @ApiOperation({ summary: 'List open fighting duel requests' })
  @ApiOkResponse({
    description: 'Pending duel requests visible to the current user',
    type: FightingDuelRequestResponseDto,
    isArray: true,
  })
  async findPending(
    @CurrentUserId() userId: string,
  ): Promise<FightingDuelRequestResponseDto[]> {
    const requests = await this.fightingDuelRequestsService.findPending(userId);

    return requests.map((request) =>
      FightingResponseMapper.toDuelRequestResponseDto(request),
    );
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept a fighting duel request' })
  @ApiParam({ name: 'id', description: 'Fighting duel request ID' })
  @ApiCreatedResponse({
    description: 'Duel request accepted and battle room created',
    type: FightingDuelAcceptResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid duel request acceptance' })
  @ApiNotFoundResponse({ description: 'Duel request not found' })
  @ApiConflictResponse({ description: 'Duel request is not pending' })
  async accept(
    @CurrentUserId() userId: string,
    @Param('id') requestId: string,
  ): Promise<FightingDuelAcceptResponseDto> {
    const result = await this.fightingDuelRequestsService.accept(
      requestId,
      userId,
    );

    return FightingResponseMapper.toDuelAcceptResponseDto(result);
  }
}
