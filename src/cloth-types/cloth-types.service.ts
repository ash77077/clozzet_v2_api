import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClothType } from './schemas/cloth-type.schema';
import { CreateClothTypeDto } from './dto/create-cloth-type.dto';

@Injectable()
export class ClothTypesService {
  constructor(
    @InjectModel(ClothType.name) private readonly clothTypeModel: Model<ClothType>,
  ) {}

  async create(dto: CreateClothTypeDto): Promise<ClothType> {
    return new this.clothTypeModel(dto).save();
  }

  async findAll(): Promise<ClothType[]> {
    return this.clothTypeModel
      .find({ isActive: true })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<ClothType[]> {
    return this.clothTypeModel.find().sort({ sortOrder: 1 }).exec();
  }

  async findOne(id: string): Promise<ClothType> {
    const clothType = await this.clothTypeModel.findById(id).exec();
    if (!clothType) {
      throw new NotFoundException(`ClothType with id ${id} not found`);
    }
    return clothType;
  }

  async update(id: string, dto: Partial<CreateClothTypeDto>): Promise<ClothType> {
    const clothType = await this.clothTypeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!clothType) {
      throw new NotFoundException(`ClothType with id ${id} not found`);
    }
    return clothType;
  }

  async remove(id: string): Promise<void> {
    const result = await this.clothTypeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`ClothType with id ${id} not found`);
    }
  }
}
