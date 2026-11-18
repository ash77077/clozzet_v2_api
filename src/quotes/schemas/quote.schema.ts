import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuoteDocument = Quote & Document;

export class QuoteItem {
  itemId: string;
  garmentTypeId?: string;
  garmentTypeName?: string;
  fabricId?: string;
  fabricName?: string;
  colorId?: string;
  colorName?: string;
  description: string;
  decorationMethod?: string;
  logoPosition?: string;
  logoSize?: string;
  quantity: number;
  sizeBreakdown?: Record<string, any>;
  unitPrice: number;
  lineDiscountPercent?: number;
  lineTotal: number;
  imageUrl?: string;
  sortOrder: number;
  estimatedUnitCost?: number;
}

@Schema({ timestamps: true })
export class Quote extends Document {
  @Prop({ required: true, unique: true })
  number: string; // Q-2026-0001

  @Prop({ type: Number, default: 1 })
  version: number;

  @Prop({ required: true })
  dealId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop()
  customerName?: string; // denormalized

  @Prop()
  contactPersonId?: string;

  @Prop()
  contactName?: string; // denormalized

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  ownerName: string; // denormalized

  @Prop({
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired', 'superseded'],
    default: 'draft',
  })
  status: string;

  @Prop()
  issueDate?: Date;

  @Prop()
  validUntil?: Date;

  @Prop({ type: String, enum: ['hy', 'en'], default: 'hy' })
  language: string;

  @Prop({ type: String, enum: ['cash', 'invoice'], default: 'cash' })
  paymentType: string;

  @Prop({ type: Number, default: 50 })
  prepaymentPercent: number;

  @Prop({ type: Number })
  productionLeadTimeDays?: number;

  @Prop()
  deliveryTerms?: string;

  @Prop()
  notes?: string;

  @Prop()
  termsText?: string;

  @Prop({ type: String, enum: ['percent', 'amount'], default: 'percent' })
  discountType: string;

  @Prop({ type: Number, default: 0 })
  discountValue: number;

  @Prop({ type: Number, default: 0 })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  discountTotal: number;

  @Prop({ type: Number, default: 0 })
  total: number;

  @Prop({ type: [Object], default: [] })
  items: QuoteItem[];

  // Admin-only computed fields
  @Prop({ type: Number })
  estimatedCost?: number;

  @Prop({ type: Number })
  estimatedMargin?: number;

  @Prop({ type: Number })
  estimatedMarginPercent?: number;

  @Prop()
  sentAt?: Date;

  @Prop()
  acceptedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop()
  convertedOrderId?: string;

  @Prop()
  pdfFileId?: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  previousVersionId?: string;

  @Prop()
  latestVersionId?: string;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);

QuoteSchema.index({ dealId: 1 });
QuoteSchema.index({ customerId: 1 });
QuoteSchema.index({ status: 1 });
QuoteSchema.index({ number: 1, version: 1 });
QuoteSchema.index({ ownerId: 1 });
