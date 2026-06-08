import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FightingBattleStatusDto } from '../dto/fighting-battle-room.dto';
import { FightingBattlesService } from '../services/fighting-battles.service';

@ApiTags('fighting-battles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fighting/battles')
export class FightingBattlesController {
  constructor(private readonly fightingBattlesService: FightingBattlesService) {}

  @Get(':id/status')
  @ApiOperation({ summary: 'Get fighting battle status' })
  @ApiParam({ name: 'id', description: 'Fighting battle room ID' })
  @ApiResponse({
    status: 200,
    description: 'Current battle state',
    type: FightingBattleStatusDto,
  })
  @ApiResponse({ status: 404, description: 'Battle not found' })
  getStatus(@Param('id') battleId: string) {
    return this.fightingBattlesService.getBattleStatus(battleId);
  }
}
