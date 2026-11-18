import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PipelineStageType = 'open' | 'won' | 'lost';

@Schema({ timestamps: true })
export class PipelineStage extends Document {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  nameHy: string;

  @Prop({ required: true })
  nameEn: string;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  probability: number;

  @Prop({
    type: String,
    enum: ['open', 'won', 'lost'],
    default: 'open',
    required: true,
  })
  type: PipelineStageType;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop({ type: Boolean, default: true })
  isSystem: boolean;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const PipelineStageSchema = SchemaFactory.createForClass(PipelineStage);
