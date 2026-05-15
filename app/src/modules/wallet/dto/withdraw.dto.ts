import { Prisma } from '@generated/prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class WithdrawDto {
  @IsNotEmpty()
  @IsNumber()
  amount!: Prisma.Decimal;

  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;
}
