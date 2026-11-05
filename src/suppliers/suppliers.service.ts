import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier } from './schemas/supplier.schema';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(@InjectModel(Supplier.name) private readonly model: Model<Supplier>) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    return new this.model(dto).save();
  }

  async findAll(): Promise<Supplier[]> {
    return this.model.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findAllAdmin(): Promise<Supplier[]> {
    return this.model.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Supplier> {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException(`Supplier ${id} not found`);
    return doc;
  }

  async update(id: string, dto: Partial<CreateSupplierDto>): Promise<Supplier> {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException(`Supplier ${id} not found`);
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException(`Supplier ${id} not found`);
  }
}
