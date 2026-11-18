import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DealStageHistory } from './schemas/deal-stage-history.schema';
import { CreateDealStageHistoryDto } from './dto/create-deal-stage-history.dto';

@Injectable()
export class DealStageHistoryService {
  constructor(
    @InjectModel(DealStageHistory.name)
    private readonly historyModel: Model<DealStageHistory>,
  ) {}

  async create(dto: CreateDealStageHistoryDto): Promise<DealStageHistory> {
    const payload = {
      dealId: new Types.ObjectId(dto.dealId),
      fromStageId: dto.fromStageId
        ? new Types.ObjectId(dto.fromStageId)
        : null,
      fromStageKey: dto.fromStageKey ?? null,
      toStageId: new Types.ObjectId(dto.toStageId),
      toStageKey: dto.toStageKey,
      changedBy: new Types.ObjectId(dto.changedBy),
      changedByName: dto.changedByName,
      note: dto.note,
      changedAt: new Date(),
    };
    return new this.historyModel(payload).save();
  }

  async findByDeal(dealId: string): Promise<DealStageHistory[]> {
    return this.historyModel
      .find({ dealId: new Types.ObjectId(dealId) })
      .sort({ changedAt: -1 })
      .exec();
  }
}
