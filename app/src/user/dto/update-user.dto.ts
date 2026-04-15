import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 1073741824, description: 'Quota in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;
}
