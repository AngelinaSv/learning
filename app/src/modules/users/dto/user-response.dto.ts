import { Expose, Type } from 'class-transformer';
import { ProfileDto } from './profile.dto';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  username!: string;

  @Expose()
  @Type(() => ProfileDto)
  profile!: ProfileDto;
}
