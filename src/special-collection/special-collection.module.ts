import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpecialCollectionController } from './special-collection.controller';
import { SpecialCollectionService } from './special-collection.service';
import {
  SpecialCollectionItem,
  SpecialCollectionItemSchema,
} from './schemas/special-collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SpecialCollectionItem.name,
        schema: SpecialCollectionItemSchema,
      },
    ]),
  ],
  controllers: [SpecialCollectionController],
  providers: [SpecialCollectionService],
  exports: [SpecialCollectionService],
})
export class SpecialCollectionModule {}
