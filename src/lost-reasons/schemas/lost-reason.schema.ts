import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LostReason extends Document {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  nameHy: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ type: Boolean, default: false })
  requiresComment: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export const LostReasonSchema = SchemaFactory.createForClass(LostReason);
