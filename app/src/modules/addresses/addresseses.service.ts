import { NotFoundException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAddressDto) {
    const address = await this.prisma.address.create({
      data: {
        ...dto,
        userId,
      },
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

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    const address = await this.findOne(id, userId);

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const updated = await this.prisma.address.update({
      where: { id: address.id },
      data: {
        ...dto,
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
