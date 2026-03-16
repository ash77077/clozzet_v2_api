import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum B2BOrderStatus {
  PENDING = 'Pending',
  IN_PRODUCTION = 'In Production',
  QUALITY_CHECK = 'Quality Check',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
}

export class B2BOrderItem {
  type: string;
  quantity: number;
  size: string;
}

export class OrderTimelineEntry {
  status: B2BOrderStatus;
  changedAt: Date;
  changedBy: string;
  note?: string;
}

@Schema({ timestamps: true })
export class B2BOrder extends Document {
  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  orderedBy: string;

  @Prop({ type: [{ type: Object }], required: true })
  items: B2BOrderItem[];

  @Prop({
    type: String,
    enum: Object.values(B2BOrderStatus),
    default: B2BOrderStatus.PENDING,
  })
  status: B2BOrderStatus;

  @Prop({ type: [{ type: Object }], default: [] })
  timeline: OrderTimelineEntry[];

  @Prop()
  notes?: string;
}

export const B2BOrderSchema = SchemaFactory.createForClass(B2BOrder);
