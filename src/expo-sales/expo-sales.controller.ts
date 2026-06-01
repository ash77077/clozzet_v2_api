import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ExpoSalesService } from './expo-sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import {
  CreateExpoStockDto,
  AddExpoItemsDto,
  SellCartDto,
  ImportFromExpoDto,
  UpdateExpoItemDto,
} from './dto/expo-stock.dto';

@Controller('expo-sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ExpoSalesController {
  constructor(private readonly service: ExpoSalesService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Get(':id/summary')
  getSummary(@Param('id') id: string) { return this.service.getSummary(id); }

  @Post()
  create(@Body() dto: CreateExpoStockDto) { return this.service.create(dto); }

  @Post(':id/items')
  addItems(@Param('id') id: string, @Body() dto: AddExpoItemsDto) {
    return this.service.addItems(id, dto);
  }

  @Patch(':id/items/:index')
  updateItem(@Param('id') id: string, @Param('index') index: string, @Body() dto: UpdateExpoItemDto) {
    return this.service.updateItem(id, parseInt(index), dto);
  }

  @Delete(':id/items/:index')
  removeItem(@Param('id') id: string, @Param('index') index: string) {
    return this.service.removeItem(id, parseInt(index));
  }

  @Post(':id/sell')
  sellCart(@Param('id') id: string, @Body() dto: SellCartDto) {
    return this.service.sellCart(id, dto);
  }

  @Post(':id/return-sale/:saleId')
  returnSale(@Param('id') id: string, @Param('saleId') saleId: string, @Body() body: { quantity?: number }) {
    return this.service.returnSale(id, saleId, body?.quantity);
  }

  @Post(':id/import')
  importFromExpo(@Param('id') id: string, @Body() dto: ImportFromExpoDto) {
    return this.service.importFromExpo(id, dto);
  }

  @Post(':id/close')
  closeExpo(@Param('id') id: string, @Body() body: { returnUnsold?: boolean }) {
    return this.service.closeExpo(id, body.returnUnsold ?? false);
  }

  @Post(':id/reopen')
  reopen(@Param('id') id: string) { return this.service.reopen(id); }

  @Delete(':id')
  deleteExpo(@Param('id') id: string) { return this.service.deleteExpo(id); }
}
