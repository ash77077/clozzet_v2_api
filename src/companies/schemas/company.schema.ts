import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    required: true,
    enum: [
      'Retail',
      'E-commerce',
      'Manufacturing',
      'Hospitality',
      'Healthcare',
      'Education',
      'Non-profit',
      'Government',
      'Other',
    ],
  })
  industry: string;

  @Prop({
    required: true,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  })
  size: string;

  @Prop()
  website?: string;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
