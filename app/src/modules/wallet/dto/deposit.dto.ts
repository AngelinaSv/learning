import { Prisma } from '@generated/prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DepositDto {
  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: Prisma.Decimal;
}
