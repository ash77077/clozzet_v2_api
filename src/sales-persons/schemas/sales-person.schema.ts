import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SalesPerson extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  email: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SalesPersonSchema = SchemaFactory.createForClass(SalesPerson);

// Create index for name to improve search performance
SalesPersonSchema.index({ name: 1 });