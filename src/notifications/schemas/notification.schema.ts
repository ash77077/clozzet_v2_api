import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['mention', 'status_change', 'order_created', 'order_updated', 'file_uploaded', 'comment', 'order_request', 'follow_up_reminder'] })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  link?: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductDetails' })
  orderId?: Types.ObjectId;

  @Prop()
  orderNumber?: string;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  fromUser?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  fromUserId?: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);