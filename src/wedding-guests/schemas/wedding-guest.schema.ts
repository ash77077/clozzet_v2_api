import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Attending {
  YES = 'yes',
  NO = 'no',
  MAYBE = 'maybe',
}

@Schema({ timestamps: true })
export class WeddingGuest extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: Object.values(Attending), default: Attending.YES })
  attending: Attending;

  @Prop({ type: Number, default: 1 })
  guestCount: number;

  @Prop()
  message?: string;
}

export const WeddingGuestSchema = SchemaFactory.createForClass(WeddingGuest);
