import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Supplier extends Document {
  @Prop({ required: true }) name: string;
  @Prop() phone?: string;
  @Prop() email?: string;
  @Prop() notes?: string;
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
