import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AddressesService } from './addresseses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/addresses')
export class AddressesController {
  constructor(private readonly addressService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({ status: 201, description: 'Address created' })
  create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUserId() userId: string,
  ) {
    return this.addressService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses' })
  @ApiResponse({ status: 200, description: 'Returns all addresses' })
  findAll(@CurrentUserId() userId: string) {
    return this.addressService.findAllForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  @ApiResponse({ status: 200, description: 'Returns the address' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  findOne(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.addressService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @CurrentUserId() userId: string,
  ) {
    return this.addressService.update(id, userId, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted' })
  @ApiParam({ name: 'id', description: 'Address ID' })
  remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.addressService.remove(id, userId);
  }
}
