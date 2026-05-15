import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RouletteBetType } from '@generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SpinRouletteDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @ApiProperty({ enum: RouletteBetType })
  @IsNotEmpty()
  @IsEnum(RouletteBetType)
  betType!: RouletteBetType;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  betValue!: string;
}
