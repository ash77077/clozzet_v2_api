import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  PARTIAL = 'partial',
}

export enum PaymentPeriod {
  FIRST_HALF = 'first_half',
  SECOND_HALF = 'second_half',
  FULL_MONTH = 'full_month',
  BONUS = 'bonus',
}

@Schema({ timestamps: true })
export class SalaryPayment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true }) employee: Types.ObjectId;
  @Prop({ required: true }) month: number;
  @Prop({ required: true }) year: number;
  @Prop({ type: String, enum: Object.values(PaymentPeriod), required: true }) period: PaymentPeriod;
  @Prop({ type: Number, required: true }) amount: number;
  @Prop({ type: Number, default: 0 }) cashAmount: number;
  @Prop({ type: Number, default: 0 }) cardAmount: number;
  @Prop({ type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING }) status: PaymentStatus;
  @Prop() paidAt?: Date;
  @Prop() notes?: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) paidBy?: Types.ObjectId;
}

export const SalaryPaymentSchema = SchemaFactory.createForClass(SalaryPayment);
