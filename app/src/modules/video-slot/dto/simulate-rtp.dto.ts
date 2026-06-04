import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class SimulateRtpDto {
  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(1000000)
  spins?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  bet?: number;

  @ApiPropertyOptional({
    example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(15, { each: true })
  lines?: number[];

  @ApiPropertyOptional({ example: 1, enum: [0, 1] })
  @IsOptional()
  @IsIn([0, 1])
  mode?: number;
}
