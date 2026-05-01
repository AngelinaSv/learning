import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserByAdminDto {
  @IsBoolean()
  @IsOptional()
  isBanned?: boolean;

  @IsOptional()
  banEndAt?: Date | null;
}
