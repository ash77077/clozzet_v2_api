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

  @Prop()
  companyName?: string;

  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  salesPerson: string;

  @Prop({ required: true })
  deadline: string;

  @Prop({ min: 0, default: 0 })
  quantity: number;

  @Prop({ required: true, enum: ['low', 'normal', 'high', 'urgent'] })
  priority: string;

  @Prop()
  status?: string;

  @Prop()
  startDate?: string;

  // Products array - for orders with multiple product types
  @Prop({
    type: [{
      clothType: { type: String, required: true },
      textileType: { type: String },
      designMethod: { type: String },
      colors: { type: String },
      customColorDetails: { type: String },
      logoPosition: { type: String },
      logoSize: { type: String },
      comments: { type: String },
      costPricePerUnit: { type: Number },
      sellingPricePerUnit: { type: Number },
      sizes: {
        type: {
          xs: { men: Number, women: Number, uni: Number },
          s: { men: Number, women: Number, uni: Number },
          m: { men: Number, women: Number, uni: Number },
          l: { men: Number, women: Number, uni: Number },
          xl: { men: Number, women: Number, uni: Number },
          xxl: { men: Number, women: Number, uni: Number },
          xxxl: { men: Number, women: Number, uni: Number },
          xxxxl: { men: Number, women: Number, uni: Number },
          s1_2: { men: Number, women: Number, uni: Number },
          s3_4: { men: Number, women: Number, uni: Number },
          s5_6: { men: Number, women: Number, uni: Number },
          s7_8: { men: Number, women: Number, uni: Number },
          s9_10: { men: Number, women: Number, uni: Number },
          s11_12: { men: Number, women: Number, uni: Number },
          s13_14: { men: Number, women: Number, uni: Number },
          s15_16: { men: Number, women: Number, uni: Number }
        }
      }
    }]
  })
  products?: Array<{
    clothType: string;
    textileType?: string;
    designMethod?: string;
    colors?: string;
    customColorDetails?: string;
    logoPosition?: string;
    logoSize?: string;
    comments?: string;
    costPricePerUnit?: number;
    sellingPricePerUnit?: number;
    sizes?: {
      xs?: { men?: number; women?: number; uni?: number };
      s?: { men?: number; women?: number; uni?: number };
      m?: { men?: number; women?: number; uni?: number };
      l?: { men?: number; women?: number; uni?: number };
      xl?: { men?: number; women?: number; uni?: number };
      xxl?: { men?: number; women?: number; uni?: number };
      xxxl?: { men?: number; women?: number; uni?: number };
      xxxxl?: { men?: number; women?: number; uni?: number };
      s1_2?: { men?: number; women?: number; uni?: number };
      s3_4?: { men?: number; women?: number; uni?: number };
      s5_6?: { men?: number; women?: number; uni?: number };
      s7_8?: { men?: number; women?: number; uni?: number };
      s9_10?: { men?: number; women?: number; uni?: number };
      s11_12?: { men?: number; women?: number; uni?: number };
      s13_14?: { men?: number; women?: number; uni?: number };
      s15_16?: { men?: number; women?: number; uni?: number };
    };
  }>;

  // Legacy fields for backward compatibility - kept for existing orders
  @Prop()
  clothType?: string;

  @Prop()
  textileType?: string;

  @Prop()
  fabricWeight?: number;

  @Prop({ type: [String] })
  colors?: string[];

  @Prop()
  customColorDetails?: string;

  @Prop()
  designMethod?: string;

  @Prop()
  printingMethod?: string;

  @Prop({ type: Object })
  sizeQuantities?: { [size: string]: number };

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

  @Prop({ type: String })
  createdBy?: string;

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
