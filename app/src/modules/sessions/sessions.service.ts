import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionsService {
  create(createSessionDto: any) {
    return 'This action adds a new session';
  }
}
