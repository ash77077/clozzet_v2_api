import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PipelineStage } from './schemas/pipeline-stage.schema';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';

@Injectable()
export class PipelineStagesService {
  constructor(
    @InjectModel(PipelineStage.name)
    private readonly pipelineStageModel: Model<PipelineStage>,
  ) {}

  async findAll(): Promise<PipelineStage[]> {
    return this.pipelineStageModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<PipelineStage[]> {
    return this.pipelineStageModel.find().sort({ order: 1 }).exec();
  }

  async findById(id: string): Promise<PipelineStage> {
    const stage = await this.pipelineStageModel.findById(id).exec();
    if (!stage) {
      throw new NotFoundException(`PipelineStage with id ${id} not found`);
    }
    return stage;
  }

  async findByKey(key: string): Promise<PipelineStage | null> {
    return this.pipelineStageModel.findOne({ key }).exec();
  }

  async update(id: string, dto: UpdatePipelineStageDto): Promise<PipelineStage> {
    // Explicitly strip any attempt to change immutable fields
    const safe: Partial<UpdatePipelineStageDto> = {};
    if (dto.nameHy !== undefined) safe.nameHy = dto.nameHy;
    if (dto.nameEn !== undefined) safe.nameEn = dto.nameEn;
    if (dto.probability !== undefined) safe.probability = dto.probability;

    if (Object.keys(safe).length === 0) {
      throw new BadRequestException('No updatable fields provided');
    }

    const stage = await this.pipelineStageModel
      .findByIdAndUpdate(id, safe, { new: true })
      .exec();
    if (!stage) {
      throw new NotFoundException(`PipelineStage with id ${id} not found`);
    }
    return stage;
  }
}
