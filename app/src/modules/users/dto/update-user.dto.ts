import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'new_username' })
  @IsString()
  @IsNotEmpty()
  username?: string;
}
