import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDetailsDocument = ProductDetails & Document;

@Schema({
  timestamps: true,
  collection: 'product-details',
})
export class ProductDetails {
  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  salesPerson: string;

  @Prop({ required: true })
  deadline: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, enum: ['low', 'normal', 'high', 'urgent'] })
  priority: string;

  @Prop({ required: true })
  clothType: string;

  @Prop({ required: true })
  textileType: string;

  @Prop()
  fabricWeight?: number;

  @Prop({ required: true, type: [String] })
  colors: string[];

  @Prop()
  customColorDetails?: string;

  @Prop({ required: true, type: Object })
  sizeQuantities: { [size: string]: number };

  @Prop()
  logoPosition?: string;

  @Prop()
  logoSize?: string;

  @Prop({ type: [String] })
  logoFiles?: string[];

  @Prop({ type: [String] })
  designFiles?: string[];

  @Prop({ type: [String] })
  referenceImages?: string[];

  @Prop()
  neckStyle?: string;

  @Prop()
  sleeveType?: string;

  @Prop()
  fit?: string;

  @Prop()
  hoodieStyle?: string;

  @Prop()
  pocketType?: string;

  @Prop()
  zipperType?: string;

  @Prop()
  collarStyle?: string;

  @Prop()
  buttonCount?: string;

  @Prop()
  placketStyle?: string;

  @Prop()
  bagStyle?: string;

  @Prop()
  handleType?: string;

  @Prop()
  bagDimensions?: string;

  @Prop()
  reinforcement?: string;

  @Prop()
  capStyle?: string;

  @Prop()
  visorType?: string;

  @Prop()
  closure?: string;

  @Prop()
  apronStyle?: string;

  @Prop()
  neckStrap?: string;

  @Prop()
  waistTie?: string;

  @Prop()
  pocketDetails?: string;

  @Prop()
  specialInstructions?: string;

  @Prop()
  packagingRequirements?: string;

  @Prop()
  shippingAddress?: string;

  @Prop({
    type: String,
    enum: ['pending', 'waiting_for_info', 'in_progress', 'printing', 'quality_check', 'packaging', 'done', 'on_hold'],
    default: 'pending'
  })
  manufacturingStatus?: string;

  @Prop({
    type: [{
      date: { type: Date, default: Date.now },
      author: { type: String, required: true },
      content: { type: String, required: true }
    }],
    default: []
  })
  manufacturingNotes?: Array<{
    date: Date;
    author: string;
    content: string;
  }>;
}

export const ProductDetailsSchema = SchemaFactory.createForClass(ProductDetails);
