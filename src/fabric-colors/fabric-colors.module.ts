import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FabricColor, FabricColorSchema } from './schemas/fabric-color.schema';
import { FabricColorsService } from './fabric-colors.service';
import { FabricColorsController } from './fabric-colors.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FabricColor.name, schema: FabricColorSchema }])],
  controllers: [FabricColorsController],
  providers: [FabricColorsService],
  exports: [FabricColorsService],
})
export class FabricColorsModule {}
