import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { Meeting, MeetingSchema } from './schemas/meeting.schema';
import { InteractionsModule } from '../interactions/interactions.module';
import { GoogleCalendarService } from './google-calendar.service';
import { MeetingNotificationService } from './meeting-notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Meeting.name, schema: MeetingSchema }]),
    forwardRef(() => InteractionsModule),
  ],
  providers: [MeetingsService, GoogleCalendarService, MeetingNotificationService],
  controllers: [MeetingsController],
  exports: [MeetingsService],
})
export class MeetingsModule {}
