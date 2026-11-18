import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PipelineStage,
  PipelineStageType,
} from './schemas/pipeline-stage.schema';

interface PipelineStageSeed {
  order: number;
  key: string;
  nameHy: string;
  nameEn: string;
  probability: number;
  type: PipelineStageType;
}

const DEFAULT_STAGES: PipelineStageSeed[] = [
  { order: 1, key: 'new_lead', nameHy: 'Նոր լիդ', nameEn: 'New lead', probability: 5, type: 'open' },
  { order: 2, key: 'contacted', nameHy: 'Կապ հաստատված', nameEn: 'Contacted', probability: 10, type: 'open' },
  { order: 3, key: 'discovery', nameHy: 'Կարիքի պարզում', nameEn: 'Needs discovery', probability: 20, type: 'open' },
  { order: 4, key: 'sample_design', nameHy: 'Նմուշ / դիզայն', nameEn: 'Sample / design', probability: 40, type: 'open' },
  { order: 5, key: 'quote_sent', nameHy: 'Գնառաջարկ ուղարկված', nameEn: 'Quote sent', probability: 60, type: 'open' },
  { order: 6, key: 'negotiation', nameHy: 'Բանակցություն', nameEn: 'Negotiation', probability: 80, type: 'open' },
  { order: 7, key: 'won', nameHy: 'Հաղթած', nameEn: 'Won', probability: 100, type: 'won' },
  { order: 8, key: 'lost', nameHy: 'Կորցրած', nameEn: 'Lost', probability: 0, type: 'lost' },
];

@Injectable()
export class PipelineStageSeederService {
  private readonly logger = new Logger(PipelineStageSeederService.name);

  constructor(
    @InjectModel(PipelineStage.name)
    private readonly pipelineStageModel: Model<PipelineStage>,
  ) {}

  async seed(): Promise<void> {
    let created = 0;
    let updated = 0;

    for (const stage of DEFAULT_STAGES) {
      const existing = await this.pipelineStageModel
        .findOne({ key: stage.key })
        .exec();

      if (!existing) {
        await this.pipelineStageModel.create({
          ...stage,
          isSystem: true,
          isActive: true,
        });
        created++;
      } else {
        // Keep existing names/probabilities if admin edited them,
        // but ensure structural fields are correct.
        await this.pipelineStageModel
          .updateOne(
            { key: stage.key },
            {
              $set: {
                order: stage.order,
                type: stage.type,
                isSystem: true,
              },
              $setOnInsert: {
                nameHy: stage.nameHy,
                nameEn: stage.nameEn,
                probability: stage.probability,
              },
            },
          )
          .exec();
        updated++;
      }
    }

    this.logger.log(
      `Pipeline stages seeded: ${created} created, ${updated} verified/updated`,
    );
  }
}
