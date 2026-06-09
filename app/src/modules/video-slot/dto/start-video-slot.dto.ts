import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class StartVideoSlotDto {
  @ApiPropertyOptional({ example: 1, enum: [0, 1] })
  @IsOptional()
  @IsIn([0, 1])
  mode?: number;
}
