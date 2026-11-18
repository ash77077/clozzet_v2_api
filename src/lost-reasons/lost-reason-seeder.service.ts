import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LostReason } from './schemas/lost-reason.schema';

interface LostReasonSeed {
  order: number;
  key: string;
  nameHy: string;
  nameEn: string;
  requiresComment: boolean;
}

const DEFAULT_REASONS: LostReasonSeed[] = [
  { order: 1, key: 'price', nameHy: 'Գին', nameEn: 'Price', requiresComment: false },
  { order: 2, key: 'timing', nameHy: 'Ժամկետ', nameEn: 'Timing / deadline', requiresComment: false },
  { order: 3, key: 'competitor', nameHy: 'Ընտրեցին մրցակցին', nameEn: 'Chose a competitor', requiresComment: false },
  { order: 4, key: 'quality', nameHy: 'Որակ / նմուշ', nameEn: 'Quality / sample', requiresComment: false },
  { order: 5, key: 'no_budget', nameHy: 'Բյուջե չկա', nameEn: 'No budget', requiresComment: false },
  { order: 6, key: 'no_response', nameHy: 'Պատասխան չկա', nameEn: 'No response', requiresComment: false },
  { order: 7, key: 'need_gone', nameHy: 'Կարիքը վերացավ', nameEn: 'Need disappeared', requiresComment: false },
  { order: 8, key: 'other', nameHy: 'Այլ', nameEn: 'Other', requiresComment: true },
];

@Injectable()
export class LostReasonSeederService {
  private readonly logger = new Logger(LostReasonSeederService.name);

  constructor(
    @InjectModel(LostReason.name)
    private readonly lostReasonModel: Model<LostReason>,
  ) {}

  async seed(): Promise<void> {
    let created = 0;
    let verified = 0;

    for (const reason of DEFAULT_REASONS) {
      const existing = await this.lostReasonModel
        .findOne({ key: reason.key })
        .exec();

      if (!existing) {
        await this.lostReasonModel.create({
          ...reason,
          isActive: true,
        });
        created++;
      } else {
        // Preserve admin-edited labels, just keep structural fields consistent.
        await this.lostReasonModel
          .updateOne(
            { key: reason.key },
            {
              $set: {
                order: reason.order,
                requiresComment: reason.requiresComment,
              },
              $setOnInsert: {
                nameHy: reason.nameHy,
                nameEn: reason.nameEn,
              },
            },
          )
          .exec();
        verified++;
      }
    }

    this.logger.log(
      `Lost reasons seeded: ${created} created, ${verified} verified/updated`,
    );
  }
}
