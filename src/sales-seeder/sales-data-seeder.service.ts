import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PipelineStageSeederService } from '../pipeline-stages/pipeline-stage-seeder.service';
import { LostReasonSeederService } from '../lost-reasons/lost-reason-seeder.service';

@Injectable()
export class SalesDataSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SalesDataSeederService.name);

  constructor(
    private readonly pipelineStageSeeder: PipelineStageSeederService,
    private readonly lostReasonSeeder: LostReasonSeederService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      this.logger.log('Seeding sales pipeline defaults...');
      await this.pipelineStageSeeder.seed();
      await this.lostReasonSeeder.seed();
      this.logger.log('Sales pipeline seed complete');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Sales pipeline seed failed: ${message}`);
    }
  }
}
