import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class FabricColor extends Document {
  @Prop({ required: true }) fabricTypeId: string;
  @Prop({ required: true }) nameArm: string;
  @Prop() nameEng?: string;
  @Prop() hex?: string;
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}

export const FabricColorSchema = SchemaFactory.createForClass(FabricColor);

// Unique color name per fabric
FabricColorSchema.index({ fabricTypeId: 1, nameArm: 1 }, { unique: true });
