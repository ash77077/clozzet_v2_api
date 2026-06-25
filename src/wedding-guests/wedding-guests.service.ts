import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeddingGuest } from './schemas/wedding-guest.schema';
import { CreateWeddingGuestDto } from './dto/create-wedding-guest.dto';

@Injectable()
export class WeddingGuestsService {
  constructor(
    @InjectModel(WeddingGuest.name)
    private readonly model: Model<WeddingGuest>,
  ) {}

  create(dto: CreateWeddingGuestDto): Promise<WeddingGuest> {
    return new this.model(dto).save();
  }

  findAll(): Promise<WeddingGuest[]> {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async getStats() {
    const all = await this.model.find().exec();
    const yes = all.filter(g => g.attending === 'yes');
    const no  = all.filter(g => g.attending === 'no');
    const maybe = all.filter(g => g.attending === 'maybe');

    return {
      totalResponses: all.length,
      attending: yes.length,
      notAttending: no.length,
      maybe: maybe.length,
      totalGuests: yes.reduce((sum, g) => sum + (g.guestCount || 1), 0),
    };
  }

  delete(id: string): Promise<WeddingGuest | null> {
    return this.model.findByIdAndDelete(id).exec();
  }
}
