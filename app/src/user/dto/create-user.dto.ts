import {
  IsEmail,
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 1073741824, description: 'Quota in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;
}
