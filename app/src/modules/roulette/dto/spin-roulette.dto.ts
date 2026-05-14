import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { RouletteBetType } from '@generated/prisma/client';

export class SpinRouletteDto {
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsEnum(RouletteBetType)
  betType!: RouletteBetType;

  @IsNotEmpty()
  @IsString()
  betValue!: string;
}
