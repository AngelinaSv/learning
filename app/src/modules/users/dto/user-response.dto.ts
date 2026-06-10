import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@generated/prisma/enums';
import { ProfileDto } from './profile.dto';

export class UserResponseDto {
  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'john_doe' })
  @Expose()
  username!: string;

  @ApiProperty({ example: 'USER', enum: Role })
  @Expose()
  role!: Role;

  @ApiProperty({ type: () => ProfileDto })
  @Expose()
  @Type(() => ProfileDto)
  profile!: ProfileDto;
}
