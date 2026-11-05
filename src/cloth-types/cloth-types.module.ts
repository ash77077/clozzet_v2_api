import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClothType, ClothTypeSchema } from './schemas/cloth-type.schema';
import { ClothTypesService } from './cloth-types.service';
import { ClothTypesController } from './cloth-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClothType.name, schema: ClothTypeSchema },
    ]),
  ],
  controllers: [ClothTypesController],
  providers: [ClothTypesService],
  exports: [ClothTypesService],
})
export class ClothTypesModule {}
