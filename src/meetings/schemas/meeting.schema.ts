import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Schema({ timestamps: true })
export class Meeting extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  customerName: string;

  @Prop()
  contactPerson?: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop({ required: true })
  meetingDate: Date;

  @Prop()
  duration?: number; // minutes

  @Prop()
  notes?: string;

  @Prop({
    type: String,
    enum: Object.values(MeetingStatus),
    default: MeetingStatus.SCHEDULED,
  })
  status: MeetingStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop()
  createdByName?: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customerId?: Types.ObjectId;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
