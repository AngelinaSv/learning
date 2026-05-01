import {
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAddressDto) {
    const existingAddress = await this.prisma.addresses.findUnique({
      where: { userId: data.userId },
    });

    if (existingAddress) {
      throw new ConflictException('Address for this user already exists');
    }

    const address = await this.prisma.addresses.create({
      data,
    });

    return address;
  }

  async findOne(id: number) {
    const address = await this.prisma.addresses.findUnique({
      where: { userId: id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async update(id: number, data: UpdateAddressDto) {
    const address = await this.findOne(id);
    const updated = await this.prisma.addresses.update({
      where: { userId: address.userId },
      data: {
        ...data,
      },
    });
    return updated;
  }

  async remove(id: number) {
    const address = await this.findOne(id);
    return this.prisma.addresses.delete({ where: { userId: address.userId } });
  }
}
