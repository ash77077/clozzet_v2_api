import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SpecialCollectionItem } from './schemas/special-collection.schema';
import { CreateSpecialCollectionDto } from './dto/create-special-collection.dto';
import { UpdateSpecialCollectionDto } from './dto/update-special-collection.dto';

@Injectable()
export class SpecialCollectionService {
  constructor(
    @InjectModel(SpecialCollectionItem.name)
    private readonly model: Model<SpecialCollectionItem>,
  ) {}

  async create(dto: CreateSpecialCollectionDto): Promise<SpecialCollectionItem> {
    const variants = dto.variants.map(v => ({
      size: v.size,
      color: v.color,
      quantity: v.quantity,
      soldQuantity: 0,
    }));

    const item = new this.model({ ...dto, variants });
    return item.save();
  }

  async findAll(): Promise<SpecialCollectionItem[]> {
    return this.model.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findAllAdmin(): Promise<SpecialCollectionItem[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findByCategory(category: string): Promise<SpecialCollectionItem[]> {
    return this.model
      .find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<SpecialCollectionItem> {
    const item = await this.model.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Special collection item #${id} not found`);
    }
    return item;
  }

  async update(
    id: string,
    dto: UpdateSpecialCollectionDto,
  ): Promise<SpecialCollectionItem> {
    const updateData: any = { ...dto };

    if (dto.variants) {
      updateData.variants = dto.variants.map(v => ({
        size: v.size,
        color: v.color,
        quantity: v.quantity,
        soldQuantity: 0,
      }));
    }

    const item = await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!item) {
      throw new NotFoundException(`Special collection item #${id} not found`);
    }
    return item;
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Special collection item #${id} not found`);
    }
  }
}
