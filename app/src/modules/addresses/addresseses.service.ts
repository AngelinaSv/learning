import { NotFoundException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAddressDto) {
    const address = await this.prisma.address.create({
      data,
    });

    return address;
  }

  async findOne(id: string) {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(id: string, data: UpdateAddressDto) {
    const address = await this.findOne(id);

    if (!address) {
      throw new NotFoundException();
    }

    const updated = await this.prisma.address.update({
      where: { id: address.id },
      data: {
        ...data,
      },
    });
    return updated;
  }

  async remove(id: string) {
    const address = await this.findOne(id);
    return this.prisma.address.delete({ where: { id: address.id } });
  }

  async removeByIds(ids: string[]) {
    return this.prisma.address.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
