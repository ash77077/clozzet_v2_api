import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStandaloneSaleDto } from './dto/create-standalone-sale.dto';
import { StandaloneSale } from './schemas/standalone-sale.schema';

@Injectable()
export class StandaloneSalesService {
  constructor(
    @InjectModel(StandaloneSale.name)
    private standaloneSaleModel: Model<StandaloneSale>,
  ) {}

  async create(createStandaloneSaleDto: CreateStandaloneSaleDto): Promise<StandaloneSale> {
    const sale = new this.standaloneSaleModel({
      ...createStandaloneSaleDto,
      soldDate: new Date(),
    });
    return sale.save();
  }

  async findAll(): Promise<StandaloneSale[]> {
    return this.standaloneSaleModel.find().sort({ soldDate: -1 }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.standaloneSaleModel.findByIdAndDelete(id).exec();
  }
}
