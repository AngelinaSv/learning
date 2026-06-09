import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums';

export class AdminUserListResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'admin@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'admin' })
  @Expose()
  username!: string;

  @ApiProperty({ example: false })
  @Expose()
  isBanned!: boolean;

  @ApiProperty({ example: null, nullable: true })
  @Expose()
  banEndAt!: Date | null;

  @ApiProperty({ example: false })
  @Expose()
  isDeleted!: boolean;

  @ApiProperty({ example: 'USER', enum: Role })
  @Expose()
  role!: Role;
}
