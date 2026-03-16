import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class MonthlyExpenseReport extends Document {
  @Prop({ required: true })
  month: number; // 1-12

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, default: 0 })
  rent: number;

  @Prop({ required: true, default: 0 })
  utilities: number;

  @Prop({ required: true, default: 0 })
  fixedSalaries: number;

  @Prop({ required: true, default: 0 })
  variableDailyLabor: number;

  @Prop()
  totalOverhead?: number;
}

export const MonthlyExpenseReportSchema = SchemaFactory.createForClass(MonthlyExpenseReport);
