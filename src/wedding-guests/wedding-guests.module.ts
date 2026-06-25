import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeddingGuest, WeddingGuestSchema } from './schemas/wedding-guest.schema';
import { WeddingGuestsService } from './wedding-guests.service';
import { WeddingGuestsController } from './wedding-guests.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeddingGuest.name, schema: WeddingGuestSchema }]),
  ],
  controllers: [WeddingGuestsController],
  providers: [WeddingGuestsService],
})
export class WeddingGuestsModule {}
