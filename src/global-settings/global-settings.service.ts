import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalSettings } from './schemas/global-settings.schema';
import { UpdateGlobalSettingsDto } from './dto/update-global-settings.dto';

@Injectable()
export class GlobalSettingsService {
  constructor(
    @InjectModel(GlobalSettings.name) private readonly model: Model<GlobalSettings>,
  ) {}

  async get(): Promise<GlobalSettings> {
    const doc = await this.model.findOne({ key: 'global' }).exec();
    if (doc) return doc;
    return this.model.create({ key: 'global' });
  }

  async update(dto: UpdateGlobalSettingsDto): Promise<GlobalSettings> {
    return this.model.findOneAndUpdate(
      { key: 'global' },
      { $set: dto },
      { new: true, upsert: true },
    ).exec() as Promise<GlobalSettings>;
  }
}
