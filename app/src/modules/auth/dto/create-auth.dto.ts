import { CreateAddressDto } from 'src/modules/address/dto/create-address.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class CreateAuthDto {
  user!: CreateUserDto;
  address!: CreateAddressDto;
}
