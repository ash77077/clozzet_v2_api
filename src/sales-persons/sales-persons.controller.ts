import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalesPersonsService } from './sales-persons.service';
import { CreateSalesPersonDto } from './dto/create-sales-person.dto';
import { UpdateSalesPersonDto } from './dto/update-sales-person.dto';

@Controller('api/sales-persons')
export class SalesPersonsController {
  constructor(private readonly salesPersonsService: SalesPersonsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSalesPersonDto: CreateSalesPersonDto) {
    return await this.salesPersonsService.create(createSalesPersonDto);
  }

  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveBool = includeInactive === 'true';
    return await this.salesPersonsService.findAll(includeInactiveBool);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return await this.salesPersonsService.search(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.salesPersonsService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSalesPersonDto: UpdateSalesPersonDto,
  ) {
    return await this.salesPersonsService.update(id, updateSalesPersonDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return await this.salesPersonsService.delete(id);
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return await this.salesPersonsService.deactivate(id);
  }

  @Put(':id/activate')
  async activate(@Param('id') id: string) {
    return await this.salesPersonsService.activate(id);
  }
}