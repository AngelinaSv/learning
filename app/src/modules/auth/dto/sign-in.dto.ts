import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail({})
  email!: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsNotEmpty()
  password!: string;
}
