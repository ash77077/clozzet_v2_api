import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ConsumptionTemplate extends Document {
  @Prop({ required: true }) clothTypeId: string;
  @Prop({ required: true }) fabricTypeId: string;
  @Prop() fabricTypeName: string;
  @Prop() fabricTypeUnit: string;

  // Derived norms (adultNorm = M value, childNorm = s9_10 value)
  // Stored in the fabric's base unit (m or kg). For kg fabrics, enter/show grams in UI.
  @Prop({ type: Number }) adultNorm?: number;
  @Prop({ type: Number }) childNorm?: number;
  @Prop({ type: Boolean, default: false }) isDefault: boolean;

  // Legacy per-size norms — kept for backward compatibility; never deleted
  @Prop({ type: MongooseSchema.Types.Mixed })
  consumptionPerSize: {
    XS?: number; S?: number; M?: number; L?: number;
    XL?: number; XXL?: number; XXXL?: number; XXXXL?: number;
    s1_2?: number; s3_4?: number; s5_6?: number; s7_8?: number;
    s9_10?: number; s11_12?: number; s13_14?: number; s15_16?: number;
  };

  @Prop({ type: Boolean, default: true }) isActive: boolean;
}

export const ConsumptionTemplateSchema =
  SchemaFactory.createForClass(ConsumptionTemplate);

// Unique garment–fabric pair
ConsumptionTemplateSchema.index(
  { clothTypeId: 1, fabricTypeId: 1 },
  { unique: true },
);
