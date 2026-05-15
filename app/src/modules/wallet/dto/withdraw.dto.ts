import { Prisma } from '@generated/prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount!: Prisma.Decimal;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;
}
