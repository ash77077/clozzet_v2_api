import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DealSource {
  INBOUND_CALL = 'inbound_call',
  WEBSITE = 'website',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  LINKEDIN = 'linkedin',
  REFERRAL = 'referral',
  COLD_CALL = 'cold_call',
  EXPO = 'expo',
  EXISTING_CUSTOMER = 'existing_customer',
  OTHER = 'other',
}

export enum DealNextStepType {
  CALL = 'call',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  MEETING = 'meeting',
  SEND_SAMPLE = 'send_sample',
  SEND_QUOTE = 'send_quote',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Deal extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  contactPersonId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PipelineStage', required: true })
  stageId: Types.ObjectId;

  // Denormalized for fast filtering on board
  @Prop({ type: String, required: true, index: true })
  stageKey: string;

  @Prop({ type: Date, default: Date.now })
  stageEnteredAt: Date;

  @Prop({ type: Number, min: 0, max: 100, default: 0 })
  probability: number;

  @Prop({ type: Number })
  estimatedValue?: number;

  @Prop({ type: Number })
  estimatedQuantity?: number;

  @Prop({ type: [String], default: [] })
  garmentTypeIds?: string[];

  @Prop({ type: Date })
  expectedCloseDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(DealSource),
  })
  source?: string;

  @Prop({ type: Date })
  nextStepDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(DealNextStepType),
  })
  nextStepType?: string;

  @Prop({ type: String })
  nextStepNote?: string;

  @Prop({ type: Types.ObjectId, ref: 'LostReason', default: null })
  lostReasonId?: Types.ObjectId | null;

  @Prop({ type: String })
  lostComment?: string;

  @Prop({ type: Date })
  wonAt?: Date;

  @Prop({ type: Date })
  lostAt?: Date;

  @Prop({ type: [String], default: [] })
  orderIds: string[];

  @Prop({ type: [String], default: [] })
  quoteIds: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;
}

export const DealSchema = SchemaFactory.createForClass(Deal);

DealSchema.index({ customerId: 1, isDeleted: 1 });
DealSchema.index({ ownerId: 1, isDeleted: 1 });
DealSchema.index({ stageKey: 1, isDeleted: 1 });
