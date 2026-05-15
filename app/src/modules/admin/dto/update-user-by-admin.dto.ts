import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserByAdminDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  banEndAt?: Date | null;
}
