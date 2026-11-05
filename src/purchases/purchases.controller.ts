import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PurchasesController {
  constructor(private readonly service: PurchasesService) {}

  @Post()
  create(@Body() dto: CreatePurchaseDto, @Req() req: any) {
    const userId = req.user?.userId ?? req.user?._id ?? 'unknown';
    return this.service.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('supplierId') supplierId?: string,
    @Query('paymentType') paymentType?: string,
    @Query('paymentStatus') paymentStatus?: string,
  ) {
    return this.service.findAll({ supplierId, paymentType, paymentStatus });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/payment')
  updatePayment(
    @Param('id') id: string,
    @Body() body: { paidAmount: number; paymentStatus: string },
  ) {
    return this.service.updatePayment(id, body.paidAmount, body.paymentStatus);
  }

  // ─── Stock Lots ───────────────────────────────────────────────────────────

  @Get('stock-lots/list')
  getLots(
    @Query('fabricTypeId') fabricTypeId?: string,
    @Query('colorId') colorId?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.service.getLots({ fabricTypeId, colorId, orderId });
  }

  @Get('stock-lots/:id')
  getLot(@Param('id') id: string) {
    return this.service.getLot(id);
  }

  @Patch('stock-lots/:id/reserve')
  reserveLot(@Param('id') id: string, @Body() body: { orderId: string }) {
    return this.service.reserveLot(id, body.orderId);
  }

  // ─── Consumptions ─────────────────────────────────────────────────────────

  @Post('consumptions')
  recordConsumption(
    @Body() body: {
      lotId: string; orderId: string; quantity: number;
      orderItemIndex?: number; note?: string; adminOverride?: boolean;
    },
    @Req() req: any,
  ) {
    const userId = req.user?.userId ?? req.user?._id ?? 'unknown';
    return this.service.recordConsumption(
      body.lotId, body.orderId, body.quantity, userId,
      body.orderItemIndex, body.note, body.adminOverride,
    );
  }

  @Get('consumptions/list')
  getConsumptions(
    @Query('orderId') orderId?: string,
    @Query('lotId') lotId?: string,
  ) {
    return this.service.getConsumptions(orderId, lotId);
  }

  // ─── Adjustments ─────────────────────────────────────────────────────────

  @Post('adjustments')
  recordAdjustment(
    @Body() body: { lotId: string; countedQty: number; reason: string; note?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.userId ?? req.user?._id ?? 'unknown';
    return this.service.recordAdjustment(body.lotId, body.countedQty, body.reason, userId, body.note);
  }

  @Get('adjustments/:lotId')
  getAdjustments(@Param('lotId') lotId: string) {
    return this.service.getAdjustments(lotId);
  }
}
