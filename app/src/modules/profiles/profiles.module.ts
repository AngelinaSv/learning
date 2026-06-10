import { Module } from '@nestjs/common';
import { ProfileService } from '../profiles/profile.service';

@Module({
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfilesModule {}
