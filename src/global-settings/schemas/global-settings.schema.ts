import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Singleton document — always upsert with key='global'
@Schema({ timestamps: true })
export class GlobalSettings extends Document {
  @Prop({ default: 'global', unique: true }) key: string;
  @Prop({ type: Number, default: 5 }) fabricWastePercent: number;
  @Prop({ type: Number, default: 7 }) turnoverTaxPercent: number;
  @Prop({ type: Number }) lowStockThreshold?: number;

  // Quote defaults
  @Prop({ type: Number, default: 50 }) quoteDefaultPrepaymentPercent: number;
  @Prop({ type: Number, default: 14 }) quoteDefaultValidityDays: number;
  @Prop({ type: Number, default: 20 }) quoteDefaultLeadTimeDays: number;
  @Prop({ type: String }) quoteDefaultDeliveryTerms?: string;
  @Prop({ type: String }) quoteDefaultTermsText?: string;
}

export const GlobalSettingsSchema = SchemaFactory.createForClass(GlobalSettings);
