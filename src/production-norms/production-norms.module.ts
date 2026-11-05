import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductionNorm, ProductionNormSchema } from './schemas/production-norm.schema';
import { ProductionNormsService } from './production-norms.service';
import { ProductionNormsController } from './production-norms.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductionNorm.name, schema: ProductionNormSchema }])],
  controllers: [ProductionNormsController],
  providers: [ProductionNormsService],
  exports: [ProductionNormsService],
})
export class ProductionNormsModule {}
