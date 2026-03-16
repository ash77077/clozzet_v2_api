import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductionStatus =
  | 'pending'
  | 'in_progress'
  | 'quality_check'
  | 'packaged'
  | 'ready_for_delivery'
  | 'delivered'
  | 'completed'
  | 'reproduction'
  | 'cancelled';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class ProductionRun extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProductDefinition', required: true })
  productId: string;

  @Prop()
  productName?: string;

  @Prop({ type: Object })
  productDefinition?: any;

  @Prop({ required: true })
  quantity: number;

  @Prop({ default: 0 })
  quantityFinished?: number;

  @Prop({ required: true })
  sellingPricePerUnit: number;

  @Prop()
  totalUnitCost?: number;

  @Prop()
  grossProfit?: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  productionDate: Date;

  @Prop()
  finishedDate?: Date;

  @Prop({ default: 'pending' })
  status?: ProductionStatus;

  @Prop()
  statusNotes?: string;

  @Prop()
  month?: number;

  @Prop()
  year?: number;
}

export const ProductionRunSchema = SchemaFactory.createForClass(ProductionRun);
