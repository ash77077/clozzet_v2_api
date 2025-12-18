import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { StandaloneSalesService } from './standalone-sales.service';
import { CreateStandaloneSaleDto } from './dto/create-standalone-sale.dto';

@Controller('standalone-sales')
export class StandaloneSalesController {
  constructor(private readonly standaloneSalesService: StandaloneSalesService) {}

  @Post()
  create(@Body() createStandaloneSaleDto: CreateStandaloneSaleDto) {
    return this.standaloneSalesService.create(createStandaloneSaleDto);
  }

  @Get()
  findAll() {
    return this.standaloneSalesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.standaloneSalesService.remove(id);
  }
}
