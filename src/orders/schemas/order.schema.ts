import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop()
  clientName: string;

  @Prop()
  salesPerson: string;

  @Prop()
  deadline: Date;

  @Prop()
  quantity: number;

  @Prop({ default: 'normal' })
  priority: string;

  @Prop()
  clothType: string;

  @Prop()
  textileType: string;

  @Prop()
  fabricWeight: string;

  @Prop()
  colors: string;

  @Prop()
  customColorDetails: string;

  @Prop()
  logoPosition: string;

  @Prop()
  logoSize: string;

  @Prop()
  specialInstructions: string;

  @Prop()
  packagingRequirements: string;

  @Prop()
  shippingAddress: string;

  @Prop({ type: Object })
  sizes: {
    xs: { men: number; women: number; uni: number };
    s: { men: number; women: number; uni: number };
    m: { men: number; women: number; uni: number };
    l: { men: number; women: number; uni: number };
    xl: { men: number; women: number; uni: number };
    xxl: { men: number; women: number; uni: number };
    xxxl: { men: number; women: number; uni: number };
    xxxxl: { men: number; women: number; uni: number };
  };

  @Prop()
  grandTotal: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
