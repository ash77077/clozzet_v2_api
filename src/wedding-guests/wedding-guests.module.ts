import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeddingGuestsController } from './wedding-guests.controller';
import { WeddingGuestsService } from './wedding-guests.service';
import { WeddingGuest, WeddingGuestSchema } from './schemas/wedding-guest.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeddingGuest.name, schema: WeddingGuestSchema }]),
  ],
  controllers: [WeddingGuestsController],
  providers: [WeddingGuestsService],
})
export class WeddingGuestsModule {}
