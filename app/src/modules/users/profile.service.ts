import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from '../profile/dto/create-profile.dto';
import { UpdateProfileDto } from '../profile/dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor();

  create(createProfileDto: CreateProfileDto) {
    return 'This action adds a new profile';
  }

  findAll() {
    return `This action returns all profile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
