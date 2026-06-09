import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums';

export class UpdateUserByAdminDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  @IsOptional()
  banEndAt?: Date | null;

  @ApiPropertyOptional({ example: 'ADMIN', enum: Role })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
