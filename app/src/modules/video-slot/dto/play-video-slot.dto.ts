import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { IsBetDivisibleByLines } from '../validators/is-bet-divisible-by-lines.validator';

export class PlayVideoSlotDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @IsBetDivisibleByLines()
  bet!: number;

  @ApiProperty({ example: [1, 2, 3, 4, 5], type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(15)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(15, { each: true })
  lines!: number[];
}
