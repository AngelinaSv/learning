import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: 1073741824, description: 'Quota in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;
}
