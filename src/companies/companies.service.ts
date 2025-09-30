import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private companyModel: Model<Company>) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const createdCompany = new this.companyModel(createCompanyDto);
    return createdCompany.save();
  }

  async findById(id: string): Promise<Company | null> {
    return this.companyModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<Company | null> {
    return this.companyModel.findOne({ email }).exec();
  }

  async findAll(): Promise<Company[]> {
    return this.companyModel.find().exec();
  }

  async update(id: string, updateCompanyDto: Partial<CreateCompanyDto>): Promise<Company> {
    const updatedCompany = await this.companyModel
      .findByIdAndUpdate(id, updateCompanyDto, { new: true })
      .exec();
    
    if (!updatedCompany) {
      throw new NotFoundException('Company not found');
    }
    
    return updatedCompany;
  }

  async remove(id: string): Promise<void> {
    const result = await this.companyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Company not found');
    }
  }
}
