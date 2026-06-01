import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export class ExpoStockItem {
  @Prop({ required: true }) type: string;      // t-shirt, hoodie…
  @Prop({ required: true }) color: string;
  @Prop({ required: true }) size: string;
  @Prop({ required: true, min: 0 }) quantity: number;   // current stock
  @Prop({ required: true, default: 0 }) soldQuantity: number;
  @Prop({ required: true, min: 0 }) costPrice: number;  // price paid per unit
  @Prop({ required: false, default: 0 }) sellPrice: number; // default sell price
}

export class ExpoSaleRecord {
  @Prop({ required: true }) type: string;
  @Prop({ required: true }) color: string;
  @Prop({ required: true }) size: string;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) soldPrice: number;
  @Prop({ required: true, default: Date.now }) soldAt: Date;
  @Prop({ default: false }) isReturn: boolean;
}

export const ExpoSaleRecordSchema = new MongooseSchema(
  {
    type: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    soldPrice: { type: Number, required: true },
    soldAt: { type: Date, default: Date.now },
    isReturn: { type: Boolean, default: false },
  },
  { _id: true },
);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc: any, ret: any) {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class ExpoStock extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ default: '' }) description: string;
  @Prop({ required: true, enum: ['active', 'closed'], default: 'active' }) status: string;

  @Prop({ type: [Object], default: [] }) items: ExpoStockItem[];
  @Prop({ type: [ExpoSaleRecordSchema], default: [] }) sales: ExpoSaleRecord[];
  @Prop({ type: Date, default: null }) closedAt: Date | null;
}

export const ExpoStockSchema = SchemaFactory.createForClass(ExpoStock);
