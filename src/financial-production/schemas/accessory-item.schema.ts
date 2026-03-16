import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
export class AccessoryItem extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  unit: string; // e.g., "m", "kg", "count", "pcs", "yard", "meter"

  @Prop({ required: true, default: 0 })
  quantity: number; // Stock quantity available

  @Prop({ required: true })
  costPerUnit: number;
}

export const AccessoryItemSchema = SchemaFactory.createForClass(AccessoryItem);
