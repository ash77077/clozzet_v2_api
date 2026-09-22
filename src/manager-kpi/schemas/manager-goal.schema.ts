import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface CommissionTierOverride {
  name: string;   // e.g. "Legend"
  min: number;    // lower bound (inclusive)
  max: number;    // upper bound (inclusive, use large number for open-ended)
  rate: number;   // decimal, e.g. 0.05 for 5%
}

@Schema({ timestamps: true })
export class ManagerGoal extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  managerName: string;

  // Monthly targets
  @Prop({ type: Number, default: 0 })
  targetInteractions: number;

  @Prop({ type: Number, default: 0 })
  targetMeetings: number;

  @Prop({ type: Number, default: 0 })
  targetRevenue: number;

  // Per-manager commission tier overrides (null = use global defaults)
  @Prop({
    type: [{
      name:  { type: String, required: true },
      min:   { type: Number, required: true },
      max:   { type: Number, required: true },
      rate:  { type: Number, required: true },
    }],
    default: null,
  })
  customTiers?: CommissionTierOverride[] | null;
}

export const ManagerGoalSchema = SchemaFactory.createForClass(ManagerGoal);
