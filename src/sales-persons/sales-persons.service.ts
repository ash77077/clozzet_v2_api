import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SalesPerson } from './schemas/sales-person.schema';
import { CreateSalesPersonDto } from './dto/create-sales-person.dto';
import { UpdateSalesPersonDto } from './dto/update-sales-person.dto';

@Injectable()
export class SalesPersonsService {
  constructor(
    @InjectModel(SalesPerson.name) private salesPersonModel: Model<SalesPerson>,
  ) {}

  async create(createSalesPersonDto: CreateSalesPersonDto): Promise<SalesPerson> {
    try {
      // Check if sales person with same name already exists
      const existingSalesPerson = await this.salesPersonModel.findOne({
        name: createSalesPersonDto.name.trim(),
      });

      if (existingSalesPerson) {
        throw new ConflictException('Sales person with this name already exists');
      }

      const salesPerson = new this.salesPersonModel(createSalesPersonDto);
      return await salesPerson.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Failed to create sales person');
    }
  }

  async findAll(includeInactive: boolean = false): Promise<SalesPerson[]> {
    const query = includeInactive ? {} : { isActive: true };
    return await this.salesPersonModel
      .find(query)
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<SalesPerson> {
    const salesPerson = await this.salesPersonModel.findById(id).exec();
    if (!salesPerson) {
      throw new NotFoundException(`Sales person with ID ${id} not found`);
    }
    return salesPerson;
  }

  async findByName(name: string): Promise<SalesPerson | null> {
    return await this.salesPersonModel.findOne({ name: name.trim() }).exec();
  }

  async search(query: string): Promise<SalesPerson[]> {
    return await this.salesPersonModel
      .find({
        name: { $regex: query, $options: 'i' },
        isActive: true,
      })
      .sort({ name: 1 })
      .limit(10)
      .exec();
  }

  async update(id: string, updateSalesPersonDto: UpdateSalesPersonDto): Promise<SalesPerson> {
    // Check if name is being changed to an existing name
    if (updateSalesPersonDto.name) {
      const existingSalesPerson = await this.salesPersonModel.findOne({
        name: updateSalesPersonDto.name.trim(),
        _id: { $ne: id },
      });

      if (existingSalesPerson) {
        throw new ConflictException('Sales person with this name already exists');
      }
    }

    const updatedSalesPerson = await this.salesPersonModel
      .findByIdAndUpdate(id, updateSalesPersonDto, { new: true })
      .exec();

    if (!updatedSalesPerson) {
      throw new NotFoundException(`Sales person with ID ${id} not found`);
    }

    return updatedSalesPerson;
  }

  async delete(id: string): Promise<{ message: string }> {
    const result = await this.salesPersonModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Sales person with ID ${id} not found`);
    }
    return { message: 'Sales person deleted successfully' };
  }

  async deactivate(id: string): Promise<SalesPerson> {
    return await this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<SalesPerson> {
    return await this.update(id, { isActive: true });
  }

  async getOrCreate(name: string): Promise<SalesPerson> {
    const existingSalesPerson = await this.findByName(name);
    if (existingSalesPerson) {
      return existingSalesPerson;
    }
    return await this.create({ name });
  }
}