import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum OrderRequestStatus {
  PENDING_ADMIN = 'Pending Admin',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

@Schema({ timestamps: true })
export class OrderRequest extends Document {
  // Manager-filled fields
  @Prop({ required: true })
  modelName: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitSellingPrice: number; // in AMD

  @Prop({ required: true, min: 0 })
  totalAmount: number; // Auto-calculated: quantity * unitSellingPrice

  // Admin-filled fields
  @Prop({ default: null })
  internalCost?: number; // in AMD

  @Prop({ default: null })
  profitMargin?: number; // Auto-calculated: totalAmount - internalCost

  @Prop({ default: null })
  adminNotes?: string;

  // Status tracking
  @Prop({
    type: String,
    enum: Object.values(OrderRequestStatus),
    default: OrderRequestStatus.PENDING_ADMIN,
  })
  status: OrderRequestStatus;

  // User tracking
  @Prop({ required: true })
  createdBy: string; // Manager's user ID

  @Prop()
  approvedBy?: string; // Admin's user ID

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectedAt?: Date;
}

export const OrderRequestSchema = SchemaFactory.createForClass(OrderRequest);
