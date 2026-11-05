import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StockLot extends Document {
  @Prop({ required: true }) purchaseId: string;
  @Prop({ required: true }) purchaseLineId: string;
  @Prop({ required: true }) fabricTypeId: string;
  @Prop() fabricTypeName?: string;
  @Prop() colorId?: string;
  @Prop() colorName?: string;
  @Prop({ required: true, type: Number }) initialQty: number;
  @Prop({ required: true, type: Number }) remainingQty: number;
  @Prop({ required: true, type: Number }) unitPrice: number;
  @Prop() reservedForOrderId?: string;
  @Prop() supplierId?: string;
  @Prop() supplierName?: string;
  @Prop() purchaseDate?: Date;
}

export const StockLotSchema = SchemaFactory.createForClass(StockLot);
StockLotSchema.index({ fabricTypeId: 1, colorId: 1 });
StockLotSchema.index({ reservedForOrderId: 1 });
