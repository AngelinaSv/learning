import { Prisma } from '@generated/prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount!: Prisma.Decimal;
}
