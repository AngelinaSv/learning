import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums';

export class UpdateUserByAdminDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  banEndAt?: Date | null;

  @ApiPropertyOptional()
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
