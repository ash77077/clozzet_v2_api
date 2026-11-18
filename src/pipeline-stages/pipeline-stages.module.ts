import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PipelineStage,
  PipelineStageSchema,
} from './schemas/pipeline-stage.schema';
import { PipelineStagesService } from './pipeline-stages.service';
import { PipelineStagesController } from './pipeline-stages.controller';
import { PipelineStageSeederService } from './pipeline-stage-seeder.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PipelineStage.name, schema: PipelineStageSchema },
    ]),
  ],
  controllers: [PipelineStagesController],
  providers: [PipelineStagesService, PipelineStageSeederService],
  exports: [PipelineStagesService, PipelineStageSeederService, MongooseModule],
})
export class PipelineStagesModule {}
