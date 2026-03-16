import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpecialCollectionCategory =
  | 'hoodies'
  | 'sweatshirts'
  | 't-shirts'
  | 'tote-bags'
  | 'caps';

export const SPECIAL_COLLECTION_CATEGORIES: SpecialCollectionCategory[] = [
  'hoodies',
  'sweatshirts',
  't-shirts',
  'tote-bags',
  'caps',
];

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: any) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class SpecialCollectionItem extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false, default: 0 })
  costPrice: number;

  @Prop({ required: true, enum: SPECIAL_COLLECTION_CATEGORIES })
  category: SpecialCollectionCategory;

  @Prop()
  material: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  /** Map of color name → array of image filenames for that color */
  @Prop({ type: Object, default: {} })
  colorImages: Record<string, string[]>;

  @Prop({
    type: [
      {
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, default: 0 },
        soldQuantity: { type: Number, required: true, default: 0 },
      },
    ],
    default: [],
  })
  variants: Array<{
    size: string;
    color: string;
    quantity: number;
    soldQuantity: number;
  }>;

  @Prop({ default: true })
  isActive: boolean;
}

export const SpecialCollectionItemSchema = SchemaFactory.createForClass(SpecialCollectionItem);

SpecialCollectionItemSchema.virtual('totalQuantity').get(function() {
  return (this as any).variants.reduce(
    (sum: number, v: any) => sum + (v.quantity - v.soldQuantity),
    0,
  );
});
