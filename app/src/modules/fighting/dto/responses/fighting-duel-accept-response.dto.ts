import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FightingBattleRoomDto } from './fighting-battle-room.dto';
import { FightingDuelRequestResponseDto } from './fighting-duel-request-response.dto';

export class FightingDuelAcceptResponseDto {
  @ApiProperty({ type: () => FightingDuelRequestResponseDto })
  @Type(() => FightingDuelRequestResponseDto)
  duelRequest!: FightingDuelRequestResponseDto;

  @ApiProperty({ type: () => FightingBattleRoomDto })
  @Type(() => FightingBattleRoomDto)
  battleRoom!: FightingBattleRoomDto;
}
