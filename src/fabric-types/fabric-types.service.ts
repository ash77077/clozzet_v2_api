import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FabricType } from './schemas/fabric-type.schema';
import { CreateFabricTypeDto } from './dto/create-fabric-type.dto';

@Injectable()
export class FabricTypesService {
  constructor(
    @InjectModel(FabricType.name)
    private readonly fabricTypeModel: Model<FabricType>,
  ) {}

  async create(dto: CreateFabricTypeDto): Promise<FabricType> {
    return new this.fabricTypeModel(dto).save();
  }

  async findAll(): Promise<FabricType[]> {
    return this.fabricTypeModel
      .find({ isActive: true })
      .sort({ nameArm: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<FabricType[]> {
    return this.fabricTypeModel.find().sort({ nameArm: 1 }).exec();
  }

  async findOne(id: string): Promise<FabricType> {
    const fabricType = await this.fabricTypeModel.findById(id).exec();
    if (!fabricType) {
      throw new NotFoundException(`FabricType with id ${id} not found`);
    }
    return fabricType;
  }

  async update(
    id: string,
    dto: Partial<CreateFabricTypeDto>,
  ): Promise<FabricType> {
    const fabricType = await this.fabricTypeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!fabricType) {
      throw new NotFoundException(`FabricType with id ${id} not found`);
    }
    return fabricType;
  }

  async remove(id: string): Promise<void> {
    const result = await this.fabricTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`FabricType with id ${id} not found`);
    }
  }
}
