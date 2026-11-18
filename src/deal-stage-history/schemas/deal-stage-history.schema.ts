import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DealStageHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Deal', required: true, index: true })
  dealId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PipelineStage', default: null })
  fromStageId?: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  fromStageKey?: string | null;

  @Prop({ type: Types.ObjectId, ref: 'PipelineStage', required: true })
  toStageId: Types.ObjectId;

  @Prop({ type: String, required: true })
  toStageKey: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  changedBy: Types.ObjectId;

  @Prop({ type: String })
  changedByName?: string;

  @Prop({ type: Date, default: Date.now })
  changedAt: Date;

  @Prop({ type: String })
  note?: string;
}

export const DealStageHistorySchema =
  SchemaFactory.createForClass(DealStageHistory);
