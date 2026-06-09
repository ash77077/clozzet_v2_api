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
export class CostScenario extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  productType: string;

  @Prop({ required: true, min: 1 })
  dailyOutput: number;

  @Prop({ required: true, min: 1, default: 26 })
  workingDaysPerMonth: number;

  // Fabric
  @Prop({ required: true, min: 0 })
  fabricPricePerKg: number;

  @Prop({ required: true, min: 0 })
  fabricGramsUsed: number;

  // Accessories (flat total cost per unit)
  @Prop({ required: true, min: 0 })
  accessoriesCostPerUnit: number;

  // Labour
  @Prop({ required: true, min: 0 })
  pieceworkLabor: number;

  // Monthly fixed costs
  @Prop({ required: true, min: 0 })
  monthlyRent: number;

  @Prop({ required: true, min: 0 })
  monthlyUtilities: number;

  @Prop({ required: true, min: 0 })
  monthlyFixedSalaries: number;

  @Prop({ required: true, min: 0 })
  monthlyOther: number;

  // Optional selling price for margin calc
  @Prop({ min: 0, default: 0 })
  sellingPrice: number;
}

export const CostScenarioSchema = SchemaFactory.createForClass(CostScenario);
