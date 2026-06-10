import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { FightingDuelRequestStatus } from '../../types/fighting-duel-request.types';

const FIGHTING_DUEL_REQUEST_STATUSES: FightingDuelRequestStatus[] = [
  'pending',
  'accepted',
  'rejected',
];

export class FightingDuelRequestResponseDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  challengerId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  opponentId?: string;

  @ApiProperty({ enum: FIGHTING_DUEL_REQUEST_STATUSES })
  @IsIn(FIGHTING_DUEL_REQUEST_STATUSES)
  status!: FightingDuelRequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  battleRoomId?: string;

  @ApiProperty()
  @IsString()
  createdAt!: string;
}
