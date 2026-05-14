import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SpinRouletteDto {
  @IsNotEmpty()
  @IsString()
  sessionId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  betType!: string;

  @IsNotEmpty()
  @IsString()
  betValue!: string;
}
