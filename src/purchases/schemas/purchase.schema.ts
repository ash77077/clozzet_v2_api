import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export class PurchaseLineSubdoc {
  @Prop({ required: true }) lineType: string; // 'fabric' — extensible for Phase 2
  @Prop({ required: true }) fabricTypeId: string;
  @Prop() fabricTypeName?: string;
  @Prop() colorId?: string;
  @Prop() colorName?: string;
  @Prop({ required: true, type: Number }) quantity: number;
  @Prop({ required: true, type: Number }) unitPrice: number;
  @Prop({ required: true, type: Number }) lineTotal: number;
  @Prop() orderId?: string; // bought for a specific order (optional)
  @Prop() stockLotId?: string; // populated after lot creation
}

const PurchaseLineSchema = new MongooseSchema(
  {
    lineType: { type: String, default: 'fabric' },
    fabricTypeId: String,
    fabricTypeName: String,
    colorId: String,
    colorName: String,
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
    orderId: String,
    stockLotId: String,
  },
  { _id: true },
);

@Schema({ timestamps: true })
export class Purchase extends Document {
  @Prop({ required: true }) supplierId: string;
  @Prop() supplierName?: string;
  @Prop({ required: true }) date: Date;
  @Prop({ required: true, enum: ['cash', 'invoice'], default: 'cash' }) paymentType: string;
  @Prop() documentNumber?: string;
  @Prop() documentDate?: Date;
  @Prop({ type: Boolean, default: false }) hasDocument: boolean;
  @Prop({ type: [PurchaseLineSchema], default: [] }) lines: PurchaseLineSubdoc[];
  @Prop({ type: Number, default: 0 }) totalAmount: number;
  @Prop({ type: Number, default: 0 }) paidAmount: number;
  @Prop({ enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' }) paymentStatus: string;
  @Prop() notes?: string;
  @Prop() createdBy: string;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
