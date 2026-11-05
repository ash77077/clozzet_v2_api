import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConsumptionTemplate } from './schemas/consumption-template.schema';
import { CreateConsumptionTemplateDto } from './dto/create-consumption-template.dto';

@Injectable()
export class ConsumptionTemplatesService {
  constructor(
    @InjectModel(ConsumptionTemplate.name)
    private readonly consumptionTemplateModel: Model<ConsumptionTemplate>,
  ) {}

  async create(
    dto: CreateConsumptionTemplateDto,
  ): Promise<ConsumptionTemplate> {
    return new this.consumptionTemplateModel(dto).save();
  }

  async findAll(): Promise<ConsumptionTemplate[]> {
    return this.consumptionTemplateModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAllAdmin(): Promise<ConsumptionTemplate[]> {
    return this.consumptionTemplateModel.find().sort({ createdAt: -1 }).exec();
  }

  async findByClothType(clothTypeId: string): Promise<ConsumptionTemplate[]> {
    return this.consumptionTemplateModel
      .find({ clothTypeId, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ConsumptionTemplate> {
    const template = await this.consumptionTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException(`ConsumptionTemplate with id ${id} not found`);
    }
    return template;
  }

  async update(
    id: string,
    dto: Partial<CreateConsumptionTemplateDto>,
  ): Promise<ConsumptionTemplate> {
    const template = await this.consumptionTemplateModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!template) {
      throw new NotFoundException(`ConsumptionTemplate with id ${id} not found`);
    }
    return template;
  }

  async remove(id: string): Promise<void> {
    const result = await this.consumptionTemplateModel
      .findByIdAndDelete(id)
      .exec();
    if (!result) {
      throw new NotFoundException(`ConsumptionTemplate with id ${id} not found`);
    }
  }
}
