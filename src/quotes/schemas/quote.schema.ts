import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuoteDocument = Quote & Document;

@Schema({ timestamps: true })
export class Quote {
  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  contactName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  productType: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ type: [String], default: [] })
  additionalServices: string[];

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  budget: string;

  @Prop({ required: true })
  timeline: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const QuoteSchema = SchemaFactory.createForClass(Quote);