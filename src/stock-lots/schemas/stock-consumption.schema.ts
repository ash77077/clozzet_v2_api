import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockConsumption extends Document {
  @Prop({ required: true }) lotId: string;
  @Prop({ required: true }) orderId: string;
  @Prop() orderItemIndex?: number; // index in products array
  @Prop({ required: true, type: Number }) quantity: number;
  @Prop({ required: true, type: Number }) unitCost: number; // snapshot of lot.unitPrice
  @Prop({ type: Number }) totalCost: number; // quantity × unitCost
  @Prop() date: Date;
  @Prop() createdBy: string;
  @Prop() note?: string;
}

export const StockConsumptionSchema = SchemaFactory.createForClass(StockConsumption);
StockConsumptionSchema.index({ orderId: 1 });
StockConsumptionSchema.index({ lotId: 1 });
