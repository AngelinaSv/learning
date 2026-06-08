import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';
import { FIGHTING_HIT_ZONES } from '../constants/fighting.constants';
import { FightingHitZone } from '../types/fighting-battle.types';

export class MakeFightingMoveDto {
  @ApiProperty({
    description: 'Redis-backed fighting battle room ID.',
    example: '3efadbc5-030d-463a-bd27-7dfe66a9bb41',
  })
  @IsString()
  battleId!: string;

  @ApiProperty({ enum: FIGHTING_HIT_ZONES, example: 'head' })
  @IsIn(FIGHTING_HIT_ZONES)
  attackZone!: FightingHitZone;

  @ApiProperty({ enum: FIGHTING_HIT_ZONES, example: 'body' })
  @IsIn(FIGHTING_HIT_ZONES)
  defenseZone!: FightingHitZone;
}
