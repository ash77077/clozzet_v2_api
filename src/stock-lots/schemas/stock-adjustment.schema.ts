import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockAdjustment extends Document {
  @Prop({ required: true }) lotId: string;
  @Prop({ required: true, type: Number }) countedQty: number;
  @Prop({ required: true, type: Number }) systemQty: number; // remainingQty before adjustment
  @Prop({ required: true, type: Number }) difference: number; // countedQty - systemQty
  @Prop({ required: true, enum: ['weighing', 'loss', 'correction'] }) reason: string;
  @Prop() date: Date;
  @Prop() createdBy: string;
  @Prop() note?: string;
}

export const StockAdjustmentSchema = SchemaFactory.createForClass(StockAdjustment);
StockAdjustmentSchema.index({ lotId: 1 });
