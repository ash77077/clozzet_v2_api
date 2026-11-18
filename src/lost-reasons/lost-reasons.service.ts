import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LostReason } from './schemas/lost-reason.schema';
import { CreateLostReasonDto } from './dto/create-lost-reason.dto';
import { UpdateLostReasonDto } from './dto/update-lost-reason.dto';

@Injectable()
export class LostReasonsService {
  constructor(
    @InjectModel(LostReason.name)
    private readonly lostReasonModel: Model<LostReason>,
  ) {}

  async findAll(): Promise<LostReason[]> {
    return this.lostReasonModel.find().sort({ order: 1 }).exec();
  }

  async findById(id: string): Promise<LostReason> {
    const reason = await this.lostReasonModel.findById(id).exec();
    if (!reason) {
      throw new NotFoundException(`LostReason with id ${id} not found`);
    }
    return reason;
  }

  async create(dto: CreateLostReasonDto): Promise<LostReason> {
    return new this.lostReasonModel(dto).save();
  }

  async update(id: string, dto: UpdateLostReasonDto): Promise<LostReason> {
    const reason = await this.lostReasonModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!reason) {
      throw new NotFoundException(`LostReason with id ${id} not found`);
    }
    return reason;
  }
}
