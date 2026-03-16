import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class FabricComponent {
  @Prop({ required: true })
  fabricId: string;

  @Prop()
  fabricName?: string;

  @Prop({ required: true })
  pricePerKg: number;

  @Prop({ required: true })
  gramsUsed: number;

  @Prop()
  fabricCost?: number;
}

class AccessoryComponent {
  @Prop({ required: true })
  accessoryId: string;

  @Prop()
  accessoryName?: string;

  @Prop({ required: true })
  costPerUnit: number;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  accessoryCost?: number;
}

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
export class ProductDefinition extends Document {
  @Prop({ required: true })
  productName: string;

  @Prop()
  productCode?: string;

  @Prop({ type: Object, required: true })
  fabricComponent: FabricComponent;

  @Prop({ type: [Object], default: [] })
  accessories: AccessoryComponent[];

  @Prop({ required: true })
  pieceworkLabor: number;

  @Prop()
  totalUnitCost?: number;

  @Prop()
  sellingPrice?: number;
}

export const ProductDefinitionSchema = SchemaFactory.createForClass(ProductDefinition);
