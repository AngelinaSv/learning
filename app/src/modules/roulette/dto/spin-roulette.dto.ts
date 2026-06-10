import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RouletteBetType } from '@generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SpinRouletteDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 'NUMBER', enum: RouletteBetType })
  @IsNotEmpty()
  @IsEnum(RouletteBetType)
  betType!: RouletteBetType;

  @ApiProperty({ example: '17' })
  @IsNotEmpty()
  @IsString()
  betValue!: string;
}
