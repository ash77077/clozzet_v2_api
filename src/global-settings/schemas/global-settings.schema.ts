import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Singleton document — always upsert with key='global'
@Schema({ timestamps: true })
export class GlobalSettings extends Document {
  @Prop({ default: 'global', unique: true }) key: string;
  @Prop({ type: Number, default: 5 }) fabricWastePercent: number;
  @Prop({ type: Number, default: 7 }) turnoverTaxPercent: number;
  @Prop({ type: Number }) lowStockThreshold?: number;
}

export const GlobalSettingsSchema = SchemaFactory.createForClass(GlobalSettings);
