import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty({
    example: 'john_doe',
  })
  @IsNotEmpty()
  @IsString()
  username!: string;
}
