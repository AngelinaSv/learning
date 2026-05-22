import { Prisma } from '@generated/prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsNotEmpty()
  @IsString()
  idempotencyKey!: string;

  @ApiProperty({ example: 100.5 })
  @IsNotEmpty()
  @IsNumber()
  amount!: Prisma.Decimal;
}
