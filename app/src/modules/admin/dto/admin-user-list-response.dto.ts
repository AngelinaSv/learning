import { Expose } from 'class-transformer';
import { Role } from '@generated/prisma/enums';

export class AdminUserListResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  username!: string;

  @Expose()
  isBanned!: boolean;

  @Expose()
  banEndAt!: Date | null;

  @Expose()
  isDeleted!: boolean;

  @Expose()
  role!: Role;
}
