import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ClothType extends Document {
  @Prop({ required: true }) nameArm: string;
  @Prop({ required: true }) nameEng: string;
  @Prop({ type: Number, default: 0 }) sortOrder: number;
  @Prop({ type: Number }) defaultWastePercent?: number;
  @Prop({ type: Boolean, default: true }) isActive: boolean;
}

export const ClothTypeSchema = SchemaFactory.createForClass(ClothType);
