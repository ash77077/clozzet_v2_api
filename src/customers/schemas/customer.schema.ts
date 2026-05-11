import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum CustomerStatus {
  LEAD = 'Lead',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export interface ContactPerson {
  contactPerson: string;
  position?: string;
  phone?: string;
  email?: string;
  linkedinPage?: string;
}

@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  contactPerson: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop({ type: Array, default: [] })
  contacts?: ContactPerson[];

  @Prop({
    type: String,
    enum: Object.values(CustomerStatus),
    default: CustomerStatus.LEAD,
  })
  status: CustomerStatus;

  @Prop()
  address?: string;

  @Prop()
  website?: string;

  @Prop()
  linkedinPage?: string;

  @Prop()
  industry?: string;

  @Prop()
  notes?: string;

  @Prop()
  source?: string;

  @Prop({ default: null })
  lastContactedAt?: Date;

  @Prop({ default: null })
  nextFollowUpAt?: Date;

  @Prop({ default: null })
  scheduledMeetingAt?: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
