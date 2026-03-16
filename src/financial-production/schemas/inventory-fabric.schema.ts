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
export class InventoryFabric extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string; // e.g., "Cotton", "Polyester", "Wool", "Silk", "Blend"

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  gsm: number; // Grams per square meter (fabric weight/thickness)

  @Prop({ required: true })
  pricePerKg: number;

  @Prop({ required: true, default: 0 })
  availableKg: number;

  @Prop()
  minStockLevel?: number;

  @Prop()
  supplier?: string;

  @Prop()
  notes?: string;
}

export const InventoryFabricSchema = SchemaFactory.createForClass(InventoryFabric);
