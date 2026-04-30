import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// TOTO: separate profile update to a different DTO
export class UpdateUserDto extends PartialType(CreateUserDto) {
  profile?: {
    rating?: number;
    balance?: number;
    level?: number;
  };
}
