import { NotFoundException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateAddressDto) {
    const address = await this.prisma.address.create({
      data,
    });

    return address;
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async findAllForUser(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
    });

    return addresses;
  }

  async update(id: string, userId: string, data: UpdateAddressDto) {
    const address = await this.findOne(id, userId);

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

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
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
