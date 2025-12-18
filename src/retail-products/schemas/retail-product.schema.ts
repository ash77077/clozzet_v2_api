import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export class ProductVariant {
  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ required: true, default: 0 })
  soldQuantity: number;
}

export class SaleRecord {
  @Prop({ required: true })
  size: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  soldPrice: number;

  @Prop({ required: true, default: Date.now })
  soldDate: Date;

  @Prop({ required: false, default: false })
  isExternal: boolean;
}

export const SaleRecordSchema = new MongooseSchema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true },
  soldPrice: { type: Number, required: true },
  soldDate: { type: Date, required: true, default: Date.now },
  isExternal: { type: Boolean, required: false, default: false },
}, { _id: true });

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class RetailProduct extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false, default: 0 })
  costPrice: number;

  @Prop({ required: true })
  category: string;

  @Prop()
  material: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [ProductVariant], default: [] })
  variants: ProductVariant[];

  @Prop({ type: [SaleRecordSchema], default: [] })
  salesHistory: SaleRecord[];

  // Virtual fields that are calculated dynamically
  get totalQuantity(): number {
    return this.variants.reduce((sum, v) => sum + (v.quantity - v.soldQuantity), 0);
  }

  get totalSold(): number {
    return this.variants.reduce((sum, v) => sum + v.soldQuantity, 0);
  }
}

export const RetailProductSchema = SchemaFactory.createForClass(RetailProduct);

// Add virtuals to schema
RetailProductSchema.virtual('totalQuantity').get(function() {
  return this.variants.reduce((sum, v) => sum + (v.quantity - v.soldQuantity), 0);
});

RetailProductSchema.virtual('totalSold').get(function() {
  return this.variants.reduce((sum, v) => sum + v.soldQuantity, 0);
});
