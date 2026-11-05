import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FabricType, FabricTypeSchema } from './schemas/fabric-type.schema';
import { FabricTypesService } from './fabric-types.service';
import { FabricTypesController } from './fabric-types.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FabricType.name, schema: FabricTypeSchema },
    ]),
  ],
  controllers: [FabricTypesController],
  providers: [FabricTypesService],
  exports: [FabricTypesService],
})
export class FabricTypesModule {}
