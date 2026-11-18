import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Counter, CounterDocument } from './schemas/counter.schema';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
  ) {}

  async nextSeq(name: string): Promise<number> {
    const doc = await this.counterModel.findOneAndUpdate(
      { name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );
    return doc.seq;
  }
}
