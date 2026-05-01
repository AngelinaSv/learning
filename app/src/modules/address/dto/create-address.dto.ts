import { IsNotEmpty } from 'class-validator/types/decorator/common/IsNotEmpty';
import { IsNumber } from 'class-validator/types/decorator/typechecker/IsNumber';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';

export class CreateAddressDto {
  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  address2?: string;

  @IsString()
  country?: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;
}
