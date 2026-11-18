import { Module } from '@nestjs/common';
import { SalesDataSeederService } from './sales-data-seeder.service';
import { PipelineStagesModule } from '../pipeline-stages/pipeline-stages.module';
import { LostReasonsModule } from '../lost-reasons/lost-reasons.module';

@Module({
  imports: [PipelineStagesModule, LostReasonsModule],
  providers: [SalesDataSeederService],
  exports: [SalesDataSeederService],
})
export class SalesSeederModule {}
