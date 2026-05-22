import { Expose } from 'class-transformer';

export class ProfileDto {
  @Expose()
  level!: number;

  @Expose()
  rating!: number;
}
