import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RouletteService } from './roulette.service';
import { CreateRouletteDto } from './dto/create-roulette.dto';
import { UpdateRouletteDto } from './dto/update-roulette.dto';

@Controller('roulette')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post()
  create(@Body() createRouletteDto: CreateRouletteDto) {
    return this.rouletteService.create(createRouletteDto);
  }

  @Get()
  findAll() {
    return this.rouletteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rouletteService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRouletteDto: UpdateRouletteDto,
  ) {
    return this.rouletteService.update(+id, updateRouletteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rouletteService.remove(+id);
  }
}
