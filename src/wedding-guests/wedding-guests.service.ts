import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeddingGuest, WeddingGuestDocument } from './schemas/wedding-guest.schema';
import { CreateWeddingGuestDto } from './dto/create-wedding-guest.dto';

@Injectable()
export class WeddingGuestsService {
  constructor(
    @InjectModel(WeddingGuest.name)
    private readonly model: Model<WeddingGuestDocument>,
  ) {}

  create(dto: CreateWeddingGuestDto): Promise<WeddingGuest> {
    return this.model.create(dto);
  }

  findAll(): Promise<WeddingGuest[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async getStats() {
    const all = await this.findAll();
    const attending = all.filter(g => g.attending === 'Обязательно приду');
    const notAttending = all.filter(g => g.attending !== 'Обязательно приду' && g.attending !== '');
    return {
      total: all.length,
      attending: attending.length,
      notAttending: notAttending.length,
      pending: all.filter(g => !g.attending).length,
    };
  }
}
