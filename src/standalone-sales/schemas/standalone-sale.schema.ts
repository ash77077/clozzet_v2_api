import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class StandaloneSale extends Document {
  @Prop({ required: true })
  category: string;

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
}

export const StandaloneSaleSchema = SchemaFactory.createForClass(StandaloneSale);