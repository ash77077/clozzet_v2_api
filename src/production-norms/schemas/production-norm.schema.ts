import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ProductionNorm extends Document {
  @Prop({ required: true }) clothTypeId: string;
  @Prop({ required: true }) name: string;
  @Prop({ type: Number, required: true, min: 0 }) quantity: number;
  @Prop({ required: true }) unit: string;
  @Prop({ type: Number, required: true, min: 0 }) unitCostAmd: number;
  @Prop({ type: String }) notes?: string;
  @Prop({ type: Boolean, default: true }) isActive: boolean;
  @Prop({ type: Number, default: 0 }) sortOrder: number;
}

export const ProductionNormSchema = SchemaFactory.createForClass(ProductionNorm);
ProductionNormSchema.index({ clothTypeId: 1, name: 1 }, { unique: true });
