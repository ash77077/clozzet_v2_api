import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deal } from './schemas/deal.schema';
import { PipelineStage } from '../pipeline-stages/schemas/pipeline-stage.schema';
import { DealStageHistoryService } from '../deal-stage-history/deal-stage-history.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { User } from '../users/schemas/user.schema';

export interface DealFilters {
  ownerId?: string;
  stageKey?: string;
  customerId?: string;
  isDeleted?: boolean;
}

export interface UpdateStageOptions {
  note?: string;
  lostReasonId?: string;
  lostComment?: string;
  // If true (used by markWon), skip the "must have orderId" validation
  allowEmptyOrderIds?: boolean;
}

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    @InjectModel(Deal.name) private readonly dealModel: Model<Deal>,
    @InjectModel(PipelineStage.name)
    private readonly pipelineStageModel: Model<PipelineStage>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly historyService: DealStageHistoryService,
  ) {}

  async create(dto: CreateDealDto, userId: string): Promise<Deal> {
    const stage = await this.pipelineStageModel.findById(dto.stageId).exec();
    if (!stage) {
      throw new BadRequestException(`Invalid stageId: ${dto.stageId}`);
    }

    const deal = new this.dealModel({
      title: dto.title,
      customerId: new Types.ObjectId(dto.customerId),
      contactPersonId: dto.contactPersonId
        ? new Types.ObjectId(dto.contactPersonId)
        : null,
      ownerId: new Types.ObjectId(dto.ownerId),
      stageId: stage._id,
      stageKey: stage.key,
      stageEnteredAt: new Date(),
      probability: dto.probability ?? stage.probability,
      estimatedValue: dto.estimatedValue,
      estimatedQuantity: dto.estimatedQuantity,
      garmentTypeIds: dto.garmentTypeIds ?? [],
      expectedCloseDate: dto.expectedCloseDate
        ? new Date(dto.expectedCloseDate)
        : undefined,
      source: dto.source,
      nextStepDate: dto.nextStepDate ? new Date(dto.nextStepDate) : undefined,
      nextStepType: dto.nextStepType,
      nextStepNote: dto.nextStepNote,
      createdBy: new Types.ObjectId(userId),
    });

    await deal.save();

    // Initial history entry
    const user = await this.userModel.findById(userId).exec();
    const changedByName = user
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : undefined;

    await this.historyService.create({
      dealId: (deal as any)._id.toString(),
      fromStageId: null,
      fromStageKey: null,
      toStageId: (stage as any)._id.toString(),
      toStageKey: stage.key,
      changedBy: userId,
      changedByName,
      note: 'Deal created',
    });

    return deal;
  }

  async findAll(filters: DealFilters = {}): Promise<Deal[]> {
    const query: Record<string, any> = {
      isDeleted: filters.isDeleted ?? false,
    };
    if (filters.ownerId) query.ownerId = new Types.ObjectId(filters.ownerId);
    if (filters.stageKey) query.stageKey = filters.stageKey;
    if (filters.customerId)
      query.customerId = new Types.ObjectId(filters.customerId);

    return this.dealModel
      .find(query)
      .populate('stageId', 'nameHy nameEn key type probability order')
      .populate('customerId', 'companyName contactPerson status')
      .populate('ownerId', 'firstName lastName email')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Deal> {
    const deal = await this.dealModel
      .findById(id)
      .populate('stageId', 'nameHy nameEn key type probability order')
      .populate('customerId', 'companyName contactPerson status phone email')
      .populate('ownerId', 'firstName lastName email')
      .exec();
    if (!deal) {
      throw new NotFoundException(`Deal with id ${id} not found`);
    }
    return deal;
  }

  async update(id: string, dto: UpdateDealDto): Promise<Deal> {
    const update: Record<string, any> = { ...dto };
    if (dto.customerId) update.customerId = new Types.ObjectId(dto.customerId);
    if (dto.contactPersonId)
      update.contactPersonId = new Types.ObjectId(dto.contactPersonId);
    if (dto.ownerId) update.ownerId = new Types.ObjectId(dto.ownerId);
    if (dto.expectedCloseDate)
      update.expectedCloseDate = new Date(dto.expectedCloseDate);
    if (dto.nextStepDate) update.nextStepDate = new Date(dto.nextStepDate);

    const deal = await this.dealModel
      .findByIdAndUpdate(id, update, { new: true })
      .exec();
    if (!deal) {
      throw new NotFoundException(`Deal with id ${id} not found`);
    }
    return deal;
  }

  async updateStage(
    id: string,
    newStageId: string,
    userId: string,
    opts: UpdateStageOptions = {},
  ): Promise<Deal> {
    const deal = await this.dealModel.findById(id).exec();
    if (!deal) {
      throw new NotFoundException(`Deal with id ${id} not found`);
    }
    if (deal.isDeleted) {
      throw new BadRequestException('Cannot change stage on a deleted deal');
    }

    const newStage = await this.pipelineStageModel.findById(newStageId).exec();
    if (!newStage) {
      throw new BadRequestException(`Invalid stageId: ${newStageId}`);
    }

    // Transition validation
    if (newStage.key === 'lost') {
      if (!opts.lostReasonId) {
        throw new BadRequestException(
          'lostReasonId is required when moving to "lost" stage',
        );
      }
    }

    if (newStage.key === 'won' && !opts.allowEmptyOrderIds) {
      if (!deal.orderIds || deal.orderIds.length === 0) {
        throw new BadRequestException(
          'At least one orderId is required before moving to "won" stage',
        );
      }
    }

    if (newStage.type === 'open') {
      if (!deal.nextStepDate) {
        // Soft warning per spec (frontend handles the UX); do not hard-block.
        this.logger.warn(
          `Deal ${id} moved to open stage ${newStage.key} without nextStepDate`,
        );
      }
    }

    const fromStageId = deal.stageId;
    const fromStageKey = deal.stageKey;

    deal.stageId = newStage._id as Types.ObjectId;
    deal.stageKey = newStage.key;
    deal.stageEnteredAt = new Date();
    deal.probability = newStage.probability;

    if (newStage.key === 'won') {
      deal.wonAt = new Date();
    }
    if (newStage.key === 'lost') {
      deal.lostAt = new Date();
      if (opts.lostReasonId) {
        deal.lostReasonId = new Types.ObjectId(opts.lostReasonId);
      }
      if (opts.lostComment !== undefined) deal.lostComment = opts.lostComment;
    }

    await deal.save();

    const user = await this.userModel.findById(userId).exec();
    const changedByName = user
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : undefined;

    await this.historyService.create({
      dealId: (deal as any)._id.toString(),
      fromStageId: fromStageId ? fromStageId.toString() : null,
      fromStageKey: fromStageKey ?? null,
      toStageId: (newStage as any)._id.toString(),
      toStageKey: newStage.key,
      changedBy: userId,
      changedByName,
      note: opts.note,
    });

    return this.findOne(id);
  }

  async markWon(id: string, orderId: string, userId: string): Promise<Deal> {
    const deal = await this.dealModel.findById(id).exec();
    if (!deal) {
      throw new NotFoundException(`Deal with id ${id} not found`);
    }
    if (!orderId) {
      throw new BadRequestException('orderId is required to mark a deal as won');
    }

    if (!deal.orderIds.includes(orderId)) {
      deal.orderIds.push(orderId);
      await deal.save();
    }

    const wonStage = await this.pipelineStageModel
      .findOne({ key: 'won' })
      .exec();
    if (!wonStage) {
      throw new BadRequestException(
        'Won stage is not seeded; cannot mark deal as won',
      );
    }

    return this.updateStage(id, (wonStage as any)._id.toString(), userId, {
      allowEmptyOrderIds: true,
      note: `Marked won with order ${orderId}`,
    });
  }

  async markLost(
    id: string,
    lostReasonId: string,
    lostComment: string | undefined,
    userId: string,
  ): Promise<Deal> {
    if (!lostReasonId) {
      throw new BadRequestException(
        'lostReasonId is required to mark a deal as lost',
      );
    }

    const lostStage = await this.pipelineStageModel
      .findOne({ key: 'lost' })
      .exec();
    if (!lostStage) {
      throw new BadRequestException(
        'Lost stage is not seeded; cannot mark deal as lost',
      );
    }

    return this.updateStage(id, (lostStage as any)._id.toString(), userId, {
      lostReasonId,
      lostComment,
      note: 'Marked lost',
    });
  }

  async softDelete(id: string, userId: string): Promise<Deal> {
    const deal = await this.dealModel
      .findByIdAndUpdate(
        id,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();
    if (!deal) {
      throw new NotFoundException(`Deal with id ${id} not found`);
    }
    this.logger.log(`Deal ${id} soft-deleted by user ${userId}`);
    return deal;
  }
}
