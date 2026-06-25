import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  MIXED = 'mixed',
}

@Schema({ timestamps: true })
export class Employee extends Document {
  @Prop({ required: true }) firstName: string;
  @Prop({ required: true }) lastName: string;
  @Prop() position: string;
  @Prop() department: string;
  @Prop() phone?: string;
  @Prop() email?: string;
  @Prop({ type: Number, required: true }) monthlySalary: number;
  @Prop({ type: String, enum: Object.values(EmployeeStatus), default: EmployeeStatus.ACTIVE }) status: EmployeeStatus;
  @Prop({ type: String, enum: Object.values(PaymentMethod), default: PaymentMethod.MIXED }) paymentMethod: PaymentMethod;
  @Prop({ type: Number, default: 0 }) cashPortion: number;
  @Prop({ type: Number, default: 0 }) cardPortion: number;
  @Prop() notes?: string;
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
