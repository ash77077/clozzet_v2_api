import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeddingGuestDocument = WeddingGuest & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class WeddingGuest {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  attending: string;

  @Prop({ default: '' })
  drinks: string;

  @Prop({ default: '' })
  music: string;

  @Prop()
  submittedAt: string;
}

export const WeddingGuestSchema = SchemaFactory.createForClass(WeddingGuest);
