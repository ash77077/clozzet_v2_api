import {
  Body, Controller, Get, Param, Patch, Post, Query,
  Req, Res, UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';
import { QuotesService } from './quotes.service';
import { QuotePdfService } from './pdf/quote-pdf.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UsersService } from '../users/users.service';
import { CustomersService } from '../customers/customers.service';

@Controller('quotes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class QuotesController {
  constructor(
    private readonly quotesService: QuotesService,
    private readonly pdfService: QuotePdfService,
    private readonly usersService: UsersService,
    private readonly customersService: CustomersService,
  ) {}

  @Get()
  findAll(
    @Query('dealId') dealId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('ownerId') ownerId?: string,
    @Req() req?: any,
  ) {
    return this.quotesService.findAll({ dealId, customerId, status, ownerId }, req.user?.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.quotesService.findOne(id, req.user?.role);
  }

  @Post()
  async create(@Body() dto: CreateQuoteDto, @Req() req: any) {
    const userId = req.user.userId;
    const userRecord = await this.usersService.findById(userId);
    const ownerName = userRecord
      ? `${userRecord.firstName ?? ''} ${userRecord.lastName ?? ''}`.trim()
      : '';
    return this.quotesService.create(dto, userId, req.user.role, ownerName);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateQuoteDto>, @Req() req: any) {
    return this.quotesService.update(id, dto, req.user?.role);
  }

  @Post(':id/send')
  send(@Param('id') id: string) {
    return this.quotesService.send(id);
  }

  @Post(':id/new-version')
  async newVersion(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.userId;
    const userRecord = await this.usersService.findById(userId);
    const ownerName = userRecord
      ? `${userRecord.firstName ?? ''} ${userRecord.lastName ?? ''}`.trim()
      : '';
    return this.quotesService.createNewVersion(id, userId, ownerName, req.user.role);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string) {
    return this.quotesService.markAccepted(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.quotesService.markRejected(id, reason);
  }

  @Post(':id/convert-to-order')
  async convertToOrder(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserType,
  ) {
    const userRecord = await this.usersService.findById(user.userId);
    const userName = userRecord
      ? `${userRecord.firstName ?? ''} ${userRecord.lastName ?? ''}`.trim()
      : user.email;
    return this.quotesService.convertToOrder(id, user.userId, userName);
  }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const quote = await this.quotesService.findOne(id, req.user?.role);

    // Backfill customerName / contactName for quotes created before the fix
    if (!quote.customerName && quote.customerId) {
      try {
        const customer = await this.customersService.findById(quote.customerId);
        if (customer?.companyName) (quote as any).customerName = customer.companyName;
        if (!quote.contactName && quote.contactPersonId && customer?.contacts?.length) {
          const c = (customer.contacts as any[]).find(
            (x) => x.contactPerson === quote.contactPersonId || x._id?.toString() === quote.contactPersonId,
          );
          if (c) (quote as any).contactName = c.contactPerson;
        }
      } catch { /* non-fatal */ }
    }

    const buffer = await this.pdfService.generate(quote);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${quote.number}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }
}

