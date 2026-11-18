import {
  BadRequestException, Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Quote, QuoteDocument } from './schemas/quote.schema';
import { Counter, CounterDocument } from './schemas/counter.schema';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { ProductDetailsService } from '../product-details/product-details.service';
import { DealsService } from '../deals/deals.service';
import { CustomersService } from '../customers/customers.service';
import { CustomerStatus } from '../customers/schemas/customer.schema';

function computeTotals(items: any[], discountType: string, discountValue: number) {
  const subtotal = items.reduce((s, it) => {
    const disc = it.lineDiscountPercent ?? 0;
    it.lineTotal = +(it.quantity * it.unitPrice * (1 - disc / 100)).toFixed(2);
    return s + it.lineTotal;
  }, 0);

  let discountTotal = 0;
  if (discountType === 'percent') discountTotal = +(subtotal * discountValue / 100).toFixed(2);
  else discountTotal = +Math.min(discountValue, subtotal).toFixed(2);

  return { subtotal: +subtotal.toFixed(2), discountTotal, total: +(subtotal - discountTotal).toFixed(2) };
}

function stripAdminFields(quote: any): any {
  if (!quote) return quote;
  const obj = typeof quote.toObject === 'function' ? quote.toObject() : { ...quote };
  delete obj.estimatedCost;
  delete obj.estimatedMargin;
  delete obj.estimatedMarginPercent;
  if (Array.isArray(obj.items)) {
    obj.items = obj.items.map((it: any) => { delete it.estimatedUnitCost; return it; });
  }
  return obj;
}

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectModel(Counter.name) private readonly counterModel: Model<CounterDocument>,
    private readonly productDetailsService: ProductDetailsService,
    private readonly dealsService: DealsService,
    private readonly customersService: CustomersService,
  ) {}

  private async nextNumber(): Promise<string> {
    const doc = await this.counterModel.findOneAndUpdate(
      { name: 'quote' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    const year = new Date().getFullYear();
    return `Q-${year}-${String(doc.seq).padStart(4, '0')}`;
  }

  async create(dto: CreateQuoteDto, userId: string, userRole: string, ownerName: string): Promise<Quote> {
    const number = await this.nextNumber();
    const issueDate = new Date();
    const validUntil = new Date(issueDate);
    validUntil.setDate(validUntil.getDate() + (dto.validityDays ?? 14));

    // Resolve customer name and contact name at creation time for PDF display
    let customerName: string | undefined;
    let contactName: string | undefined;
    try {
      const customer = await this.customersService.findById(dto.customerId);
      customerName = customer?.companyName || undefined;
      if (dto.contactPersonId && customer?.contacts?.length) {
        const contact = (customer.contacts as any[]).find(
          (c) => c.contactPerson === dto.contactPersonId || c._id?.toString() === dto.contactPersonId,
        );
        contactName = contact?.contactPerson || dto.contactPersonId;
      } else if (dto.contactPersonId) {
        contactName = dto.contactPersonId;
      }
    } catch {
      // non-fatal — quote can still be created without denormalized names
    }

    const items = (dto.items ?? []).map((it, i) => ({
      ...it,
      itemId: it.itemId ?? `item-${Date.now()}-${i}`,
      sortOrder: it.sortOrder ?? i,
      lineTotal: 0,
      estimatedUnitCost: userRole === 'admin' ? it.estimatedUnitCost : undefined,
    }));

    const { subtotal, discountTotal, total } = computeTotals(
      items, dto.discountType ?? 'percent', dto.discountValue ?? 0,
    );

    const doc = new this.quoteModel({
      number,
      dealId: dto.dealId,
      customerId: dto.customerId,
      customerName,
      contactPersonId: dto.contactPersonId,
      contactName,
      ownerId: userId,
      ownerName,
      issueDate,
      validUntil,
      language: dto.language ?? 'hy',
      paymentType: dto.paymentType ?? 'cash',
      prepaymentPercent: dto.prepaymentPercent ?? 50,
      productionLeadTimeDays: dto.productionLeadTimeDays,
      deliveryTerms: dto.deliveryTerms,
      notes: dto.notes,
      termsText: dto.termsText,
      discountType: dto.discountType ?? 'percent',
      discountValue: dto.discountValue ?? 0,
      subtotal, discountTotal, total,
      items,
      createdBy: userId,
    });

    return doc.save();
  }

  async findAll(filters: { dealId?: string; customerId?: string; status?: string; ownerId?: string }, userRole: string): Promise<any[]> {
    const query: any = {};
    if (filters.dealId) query.dealId = filters.dealId;
    if (filters.customerId) query.customerId = filters.customerId;
    if (filters.status) query.status = filters.status;
    if (filters.ownerId) query.ownerId = filters.ownerId;

    const docs = await this.quoteModel.find(query).sort({ createdAt: -1 }).lean().exec();
    if (userRole !== 'admin') return docs.map(stripAdminFields);
    return docs;
  }

  async findOne(id: string, userRole: string): Promise<any> {
    const doc = await this.quoteModel.findById(id).lean().exec();
    if (!doc) throw new NotFoundException(`Quote ${id} not found`);
    return userRole !== 'admin' ? stripAdminFields(doc) : doc;
  }

  async update(id: string, dto: Partial<CreateQuoteDto>, userRole: string): Promise<Quote> {
    const existing = await this.quoteModel.findById(id).exec();
    if (!existing) throw new NotFoundException(`Quote ${id} not found`);
    if (existing.status !== 'draft') throw new BadRequestException('Only draft quotes can be edited');

    const items = dto.items
      ? dto.items.map((it, i) => ({
          ...it,
          itemId: it.itemId ?? `item-${Date.now()}-${i}`,
          sortOrder: it.sortOrder ?? i,
          lineTotal: 0,
          estimatedUnitCost: userRole === 'admin' ? it.estimatedUnitCost : undefined,
        }))
      : existing.items as any[];

    const discountType = dto.discountType ?? existing.discountType;
    const discountValue = dto.discountValue ?? existing.discountValue;
    const { subtotal, discountTotal, total } = computeTotals(items, discountType, discountValue);

    if (dto.issueDate) (dto as any).issueDate = new Date(dto.issueDate);
    if (dto.validUntil) (dto as any).validUntil = new Date(dto.validUntil);
    if (dto.validityDays && existing.issueDate) {
      const vu = new Date((dto as any).issueDate ?? existing.issueDate);
      vu.setDate(vu.getDate() + dto.validityDays);
      (dto as any).validUntil = vu;
    }

    Object.assign(existing, { ...dto, items, subtotal, discountTotal, total });
    return existing.save();
  }

  async send(id: string): Promise<Quote> {
    const doc = await this.quoteModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Quote ${id} not found`);
    if (doc.status !== 'draft') throw new BadRequestException('Only draft quotes can be sent');
    doc.status = 'sent';
    doc.sentAt = new Date();
    return doc.save();
  }

  async createNewVersion(id: string, userId: string, ownerName: string, userRole: string): Promise<Quote> {
    const existing = await this.quoteModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Quote ${id} not found`);
    if (existing.status !== 'sent') throw new BadRequestException('Only sent quotes can have a new version created');

    // Mark old as superseded
    await this.quoteModel.findByIdAndUpdate(id, { status: 'superseded' });

    const { _id, createdAt, updatedAt, sentAt, acceptedAt, rejectedAt, ...rest } = existing as any;
    const newDoc = new this.quoteModel({
      ...rest,
      version: (existing.version ?? 1) + 1,
      status: 'draft',
      ownerId: userId,
      ownerName,
      issueDate: new Date(),
      sentAt: undefined,
      acceptedAt: undefined,
      rejectedAt: undefined,
      convertedOrderId: undefined,
      previousVersionId: id,
    });
    return newDoc.save();
  }

  async markAccepted(id: string): Promise<Quote> {
    const doc = await this.quoteModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Quote ${id} not found`);
    if (doc.status !== 'sent') throw new BadRequestException('Only sent quotes can be accepted');
    doc.status = 'accepted';
    doc.acceptedAt = new Date();
    return doc.save();
  }

  async markRejected(id: string, reason: string): Promise<Quote> {
    const doc = await this.quoteModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Quote ${id} not found`);
    if (doc.status !== 'sent') throw new BadRequestException('Only sent quotes can be rejected');
    doc.status = 'rejected';
    doc.rejectedAt = new Date();
    doc.rejectionReason = reason;
    return doc.save();
  }

  async markConverted(id: string, orderId: string): Promise<Quote> {
    const doc = await this.quoteModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Quote ${id} not found`);
    if (doc.convertedOrderId) throw new BadRequestException('Quote already converted to an order');
    doc.convertedOrderId = orderId;
    doc.status = 'accepted';
    if (!doc.acceptedAt) doc.acceptedAt = new Date();
    return doc.save();
  }

  /**
   * Convert a quote to a production order (ProductDetails).
   * Accepts both 'sent' (marks accepted first) and 'accepted' quotes.
   * Discount is applied proportionally to each item's unit price so that
   * manufacturing sees the real per-unit selling price, not an order-level
   * subtraction — necessary because ProductDetails has no discount field.
   */
  async convertToOrder(
    quoteId: string,
    userId: string,
    userName: string,
  ): Promise<{ order: any; quote: Quote; deal: any }> {
    // 1. Load and validate quote
    const quote = await this.quoteModel.findById(quoteId).exec();
    if (!quote) throw new NotFoundException(`Quote ${quoteId} not found`);
    if (quote.convertedOrderId) {
      throw new BadRequestException('This quote has already been converted to an order');
    }
    if (!['sent', 'accepted'].includes(quote.status)) {
      throw new BadRequestException(
        'Only sent or accepted quotes can be converted to an order',
      );
    }

    // 2. Mark as accepted if still sent
    if (quote.status === 'sent') {
      quote.status = 'accepted';
      if (!quote.acceptedAt) quote.acceptedAt = new Date();
    }

    // 3. Compute proportional discount multiplier (1.0 when no discount)
    const discountMultiplier =
      quote.subtotal > 0 ? quote.total / quote.subtotal : 1;

    // 4. Map quote items → ProductDetails products
    const products = (quote.items as any[]).map((item) => {
      const effectiveUnitPrice = +(item.unitPrice * discountMultiplier).toFixed(2);

      // Convert sizeBreakdown { m_XS: 5, f_S: 3 } → sizes { xs: { men:5 }, s: { women:3 } }
      const sizes: Record<string, { men?: number; women?: number; uni?: number }> = {};
      if (item.sizeBreakdown) {
        for (const [key, qty] of Object.entries(item.sizeBreakdown)) {
          if (!qty) continue;
          const match = /^([mfu])_(.+)$/.exec(key);
          if (!match) continue;
          const genderCode = match[1]; // m | f | u
          const sizeKey = match[2].toLowerCase(); // xs, s, m, l, xl, xxl, xxxl, xxxxl
          if (!sizes[sizeKey]) sizes[sizeKey] = {};
          if (genderCode === 'm') sizes[sizeKey].men = (sizes[sizeKey].men ?? 0) + (qty as number);
          else if (genderCode === 'f') sizes[sizeKey].women = (sizes[sizeKey].women ?? 0) + (qty as number);
          else sizes[sizeKey].uni = (sizes[sizeKey].uni ?? 0) + (qty as number);
        }
      }

      return {
        clothType: item.garmentTypeName || item.garmentTypeId || 'Unknown',
        textileType: item.fabricName || item.fabricId || undefined,
        colors: item.colorName || item.colorId || undefined,
        designMethod: item.decorationMethod || undefined,
        logoPosition: item.logoPosition || undefined,
        logoSize: item.logoSize || undefined,
        comments: item.description || undefined,
        sellingPricePerUnit: effectiveUnitPrice,
        sizes: Object.keys(sizes).length > 0 ? sizes : undefined,
      };
    });

    // 5. Build order payload
    const notes = `Quote: ${quote.number}${quote.notes ? ' — ' + quote.notes : ''}`;
    const orderPayload: any = {
      companyName: quote.customerName || undefined,
      clientName: quote.contactName || quote.customerName || 'Unknown',
      salesPerson: userName,
      deadline: '—', // user fills after creation
      quantity: Math.max(1, quote.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0)),
      priority: 'normal',
      status: 'Confirmed',
      products,
      paymentStatus: quote.paymentType === 'cash' ? 'not_paid' : 'not_paid',
      expectedRevenue: quote.total,
      specialInstructions: notes,
      quoteId: quoteId,
      dealId: quote.dealId,
      quoteNumber: quote.number,
      createdBy: userId,
    };

    // 6. Create order (sequential saves — no transaction, standalone MongoDB)
    let order: any;
    try {
      order = await this.productDetailsService.create(orderPayload);
    } catch (err) {
      throw new BadRequestException(`Failed to create order: ${err.message}`);
    }

    const orderId = (order as any)._id?.toString() ?? (order as any).id;

    // 7. Mark quote as converted
    try {
      quote.convertedOrderId = orderId;
      await quote.save();
    } catch (err) {
      this.logger.error(`Order ${orderId} created but failed to link quote ${quoteId}: ${err.message}`);
    }

    // 8. Mark deal as won (pushes orderId + moves to won stage)
    let deal: any = null;
    try {
      deal = await this.dealsService.markWon(quote.dealId, orderId, userId);
    } catch (err) {
      this.logger.error(`Order ${orderId} created but failed to mark deal ${quote.dealId} as won: ${err.message}`);
    }

    // 9. Upgrade customer lifecycle to Active if still Lead
    try {
      const customer = await this.customersService.findById(quote.customerId);
      if (customer && customer.status === CustomerStatus.LEAD) {
        await this.customersService.update(quote.customerId, { status: CustomerStatus.ACTIVE } as any);
      }
    } catch (err) {
      this.logger.error(`Failed to upgrade customer ${quote.customerId} lifecycle: ${err.message}`);
    }

    return { order, quote, deal };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOverdueQuotes(): Promise<void> {
    const now = new Date();
    const result = await this.quoteModel.updateMany(
      { status: 'sent', validUntil: { $lt: now } },
      { $set: { status: 'expired' } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`Expired ${result.modifiedCount} overdue quotes`);
    }
  }
}
