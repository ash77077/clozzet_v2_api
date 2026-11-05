import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FabricType extends Document {
  @Prop({ required: true }) nameArm: string;
  @Prop({ required: true }) nameEng: string;
  @Prop({ required: true, enum: ['m', 'kg'], default: 'm' }) unit: string;
  @Prop() composition?: string;
  @Prop({ type: Number }) densityGsm?: number;
  @Prop({ type: Number }) widthCm?: number;
  @Prop({ type: Number }) pricePerUnitAmd?: number;
  @Prop() notes?: string;
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}

export const FabricTypeSchema = SchemaFactory.createForClass(FabricType);
