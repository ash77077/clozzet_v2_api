import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';

export interface CalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  durationMinutes: number;
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);

  constructor(private readonly configService: ConfigService) {}

  private getCalendar(): calendar_v3.Calendar {
    const email = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_EMAIL');
    const rawKey = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') ?? '';
    const privateKey = rawKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    return google.calendar({ version: 'v3', auth });
  }

  async createEvent(input: CalendarEventInput): Promise<string | null> {
    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    if (!calendarId) {
      this.logger.warn('GOOGLE_CALENDAR_ID not set, skipping calendar event creation');
      return null;
    }

    const endTime = new Date(input.startTime);
    endTime.setMinutes(endTime.getMinutes() + (input.durationMinutes || 60));

    try {
      const calendar = this.getCalendar();
      const res = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: input.title,
          description: input.description || '',
          location: input.location || '',
          start: { dateTime: input.startTime.toISOString(), timeZone: 'UTC' },
          end: { dateTime: endTime.toISOString(), timeZone: 'UTC' },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 30 },
            ],
          },
        },
      });
      this.logger.log(`Calendar event created: ${res.data.id}`);
      return res.data.id ?? null;
    } catch (err: any) {
      this.logger.error(`Failed to create calendar event: ${err?.message}`);
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    const calendarId = this.configService.get<string>('GOOGLE_CALENDAR_ID');
    if (!calendarId || !eventId) return;
    try {
      const calendar = this.getCalendar();
      await calendar.events.delete({ calendarId, eventId, sendUpdates: 'all' });
      this.logger.log(`Calendar event deleted: ${eventId}`);
    } catch (err: any) {
      this.logger.error(`Failed to delete calendar event: ${err?.message}`);
    }
  }
}
