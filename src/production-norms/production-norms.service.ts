import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductionNorm } from './schemas/production-norm.schema';
import { CreateProductionNormDto } from './dto/create-production-norm.dto';

@Injectable()
export class ProductionNormsService {
  constructor(@InjectModel(ProductionNorm.name) private readonly model: Model<ProductionNorm>) {}

  async findByClothType(clothTypeId: string): Promise<ProductionNorm[]> {
    return this.model.find({ clothTypeId, isActive: true }).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findByClothTypeAdmin(clothTypeId: string): Promise<ProductionNorm[]> {
    return this.model.find({ clothTypeId }).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async create(dto: CreateProductionNormDto): Promise<ProductionNorm> {
    try {
      return await new this.model(dto).save();
    } catch (e: any) {
      if (e.code === 11000) throw new ConflictException(`"${dto.name}" արդեն գոյություն ունի այս հագուստաձևի համար`);
      throw e;
    }
  }

  async update(id: string, dto: Partial<CreateProductionNormDto>): Promise<ProductionNorm> {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException(`ProductionNorm ${id} not found`);
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException(`ProductionNorm ${id} not found`);
  }
}
