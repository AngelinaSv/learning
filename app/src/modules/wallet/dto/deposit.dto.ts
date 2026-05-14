import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsString()
  walletId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;
}
