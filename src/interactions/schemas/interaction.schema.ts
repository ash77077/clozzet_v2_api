import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InteractionType {
  CALL = 'Call',
  EMAIL = 'Email',
  WHATSAPP = 'WhatsApp',
  TELEGRAM = 'Telegram',
  LINKEDIN = 'LinkedIn',
  IN_PERSON = 'In-person',
}

export enum CallOutcome {
  ANSWERED = 'Answered',
  BUSY = 'Busy',
  NO_ANSWER = 'No Answer',
  VOICEMAIL = 'Voicemail',
  FOLLOW_UP_NEEDED = 'Follow-up needed',
}

@Schema({ timestamps: true })
export class Interaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(InteractionType),
    required: true,
  })
  type: InteractionType;

  // Call-specific fields
  @Prop()
  duration?: number; // in minutes

  @Prop({
    type: String,
    enum: Object.values(CallOutcome),
  })
  outcome?: CallOutcome;

  // Common fields
  @Prop()
  subject?: string;

  @Prop({ required: true })
  summary: string;

  @Prop()
  attachments?: string[]; // File paths or URLs

  @Prop({ required: true, default: Date.now })
  interactionDate: Date;

  @Prop()
  nextFollowUpDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop()
  createdByName?: string; // For imported data where we don't have a user ID

  @Prop({ default: false })
  isFollowUpCompleted: boolean;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);
