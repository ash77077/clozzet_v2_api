import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FabricColor } from './schemas/fabric-color.schema';
import { CreateFabricColorDto } from './dto/create-fabric-color.dto';

export const DEFAULT_COLORS: { nameArm: string; nameEng: string; hex: string }[] = [
  { nameArm: 'Սև',               nameEng: 'Black',        hex: '#000000' },
  { nameArm: 'Սպիտակ',           nameEng: 'White',        hex: '#FFFFFF' },
  { nameArm: 'Մուգ Կապույտ',     nameEng: 'Navy Blue',    hex: '#1F2D6B' },
  { nameArm: 'Մոխրագույն',       nameEng: 'Grey',         hex: '#808080' },
  { nameArm: 'Դեղին',            nameEng: 'Yellow',       hex: '#FFD700' },
  { nameArm: 'Կարմիր',           nameEng: 'Red',          hex: '#CC0000' },
  { nameArm: 'Կանաչ',            nameEng: 'Green',        hex: '#228B22' },
  { nameArm: 'Կաթնագույն',       nameEng: 'Cream',        hex: '#FFFDD0' },
  { nameArm: 'Էլեկտրիկ Կապույտ', nameEng: 'Electric Blue', hex: '#0047AB' },
  { nameArm: 'Նարնջագույն',      nameEng: 'Orange',       hex: '#FF6600' },
  { nameArm: 'Մանուշակագույն',   nameEng: 'Purple',       hex: '#6A0DAD' },
  { nameArm: 'Վարդագույն',       nameEng: 'Pink',         hex: '#FF69B4' },
  { nameArm: 'Մելանժ',           nameEng: 'Melange',      hex: '#A9A9A9' },
  { nameArm: 'Խակի',             nameEng: 'Khaki',        hex: '#8B864E' },
  { nameArm: 'Շականակագույն',    nameEng: 'Brown',        hex: '#6B3A2A' },
];

@Injectable()
export class FabricColorsService {
  constructor(
    @InjectModel(FabricColor.name)
    private readonly model: Model<FabricColor>,
  ) {}

  async create(dto: CreateFabricColorDto): Promise<FabricColor> {
    try {
      return await new this.model(dto).save();
    } catch (e: any) {
      if (e.code === 11000) throw new ConflictException('Color name already exists for this fabric');
      throw e;
    }
  }

  async findByFabric(fabricTypeId: string): Promise<FabricColor[]> {
    return this.model.find({ fabricTypeId, isActive: true }).sort({ nameArm: 1 }).exec();
  }

  async findByFabricAdmin(fabricTypeId: string): Promise<FabricColor[]> {
    return this.model.find({ fabricTypeId }).sort({ nameArm: 1 }).exec();
  }

  async findAll(): Promise<FabricColor[]> {
    return this.model.find({ isActive: true }).sort({ fabricTypeId: 1, nameArm: 1 }).exec();
  }

  async update(id: string, dto: Partial<CreateFabricColorDto>): Promise<FabricColor> {
    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!doc) throw new NotFoundException(`FabricColor ${id} not found`);
    return doc;
  }

  async remove(id: string): Promise<void> {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundException(`FabricColor ${id} not found`);
  }

  async seedDefaults(fabricTypeId: string): Promise<{ created: number; skipped: number }> {
    let created = 0;
    let skipped = 0;
    for (const color of DEFAULT_COLORS) {
      try {
        await new this.model({ ...color, fabricTypeId, isActive: true }).save();
        created++;
      } catch (e: any) {
        if (e.code === 11000) skipped++;
        else throw e;
      }
    }
    return { created, skipped };
  }
}
