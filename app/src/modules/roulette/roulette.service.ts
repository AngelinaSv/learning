import { Injectable } from '@nestjs/common';
import { CreateRouletteDto } from './dto/create-roulette.dto';
import { UpdateRouletteDto } from './dto/update-roulette.dto';
import * as crypto from 'node:crypto';

let gameRoom = {};
const nounce = 0;

const generateResult = (
  serverSeed: string,
  clientSeed: string,
  nounce: number,
) => {
  const hmac = crypto.createHmac('sha256', serverSeed);
  hmac.update(`${clientSeed}:${nounce}`);
  const hash = hmac.digest('hex');
  const result = parseInt(hash.slice(0, 8), 16) % 37;
  return result;
};

@Injectable()
export class RouletteService {
  create(createRouletteDto: CreateRouletteDto) {
    const serverSeed = crypto.randomBytes(32).toString('hex');
    const serverHash = crypto
      .createHash('sha256')
      .update(serverSeed)
      .digest('hex');
    gameRoom = { serverSeed, serverHash };
    return {
      success: true,
      serverHash,
    };
  }

  findAll() {
    return `This action returns all roulette`;
  }

  findOne(id: number) {
    return `This action returns a #${id} roulette`;
  }

  update(id: number, updateRouletteDto: UpdateRouletteDto) {
    return `This action updates a #${id} roulette`;
  }

  remove(id: number) {
    return `This action removes a #${id} roulette`;
  }
}
