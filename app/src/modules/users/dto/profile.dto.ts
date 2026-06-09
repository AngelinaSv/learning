import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ example: 5 })
  @Expose()
  level!: number;

  @ApiProperty({ example: 1200 })
  @Expose()
  rating!: number;
}
