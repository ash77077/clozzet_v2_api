import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type InventoryChangeType =
  | 'initial_stock'
  | 'restock'
  | 'waste'
  | 'waste_return'
  | 'production_use'
  | 'adjustment'
  | 'update'
  | 'delete';

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
export class FabricInventoryHistory extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'InventoryFabric', required: true })
  fabricId: string;

  @Prop()
  fabricName?: string;

  @Prop({ required: true })
  changeType: InventoryChangeType;

  @Prop({ required: true })
  quantityChange: number; // Positive for additions, negative for deductions

  @Prop({ required: true })
  quantityBefore: number;

  @Prop({ required: true })
  quantityAfter: number;

  @Prop()
  reason?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  relatedEntryId?: string;

  @Prop()
  createdBy?: string;
}

export const FabricInventoryHistorySchema = SchemaFactory.createForClass(FabricInventoryHistory);
