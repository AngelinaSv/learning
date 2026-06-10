import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFightingDuelRequestDto {
  @ApiPropertyOptional({
    description: 'Optional target user ID. Omit for an open duel request.',
    example: '8b59c4c3-8c8a-45e0-a37a-7fdc7c7f3c9e',
  })
  @IsOptional()
  @IsString()
  opponentId?: string;
}
