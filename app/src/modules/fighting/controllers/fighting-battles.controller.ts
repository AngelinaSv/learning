import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FightingBattleRoomDto } from '../dto/responses/fighting-battle-room.dto';
import { FightingResponseMapper } from '../mappers/fighting-response.mapper';
import { FightingBattlesService } from '../services/fighting-battles.service';

@ApiTags('fighting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fighting/battles')
export class FightingBattlesController {
  constructor(
    private readonly fightingBattlesService: FightingBattlesService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get fighting battle status' })
  @ApiParam({ name: 'id', description: 'Fighting battle room ID' })
  @ApiOkResponse({
    description: 'Current battle state',
    type: FightingBattleRoomDto,
  })
  @ApiNotFoundResponse({ description: 'Battle not found' })
  async getStatus(
    @Param('id') battleId: string,
  ): Promise<FightingBattleRoomDto> {
    const battle =
      await this.fightingBattlesService.getBattleRoomForApi(battleId);

    return FightingResponseMapper.toBattleRoomDto(battle);
  }
}
