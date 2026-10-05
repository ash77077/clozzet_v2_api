import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MeetingEmailInput {
  title: string;
  customerName: string;
  contactPerson?: string;
  meetingDate: Date;
  durationMinutes: number;
  location?: string;
  notes?: string;
  toEmails: string[];
}

@Injectable()
export class MeetingNotificationService {
  private readonly logger = new Logger(MeetingNotificationService.name);

  constructor(private readonly configService: ConfigService) {}

  private getTransport() {
    return nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT') ?? 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  private buildIcs(input: MeetingEmailInput, uid: string, organizerEmail: string): string {
    const start = input.meetingDate;
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + (input.durationMinutes || 60));

    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace('.000', '');

    const description = [
      `Customer: ${input.customerName}`,
      input.contactPerson ? `Contact: ${input.contactPerson}` : '',
      input.notes ? `Notes: ${input.notes}` : '',
    ]
      .filter(Boolean)
      .join('\\n');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Clozzet CRM//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${fmt(new Date())}Z`,
      `DTSTART:${fmt(start)}Z`,
      `DTEND:${fmt(end)}Z`,
      `SUMMARY:${input.title}`,
      `DESCRIPTION:${description}`,
      `ORGANIZER:mailto:${organizerEmail}`,
      input.location ? `LOCATION:${input.location}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Meeting reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(l => l !== '')
      .join('\r\n');
  }

  async sendInvitations(input: MeetingEmailInput): Promise<void> {
    const recipients = [...new Set(input.toEmails.map(e => e.trim()).filter(Boolean))];
    if (recipients.length === 0) return;

    // Use the authenticated SMTP user as both from and organizer to avoid Gmail rejections
    const smtpUser = this.configService.get<string>('SMTP_USER') ?? '';
    const from = `Clozzet CRM <${smtpUser}>`;

    const uid = `meeting-${Date.now()}@clozzet.com`;
    const ics = this.buildIcs(input, uid, smtpUser);

    const dateStr = input.meetingDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#4f46e5;padding:24px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0">📅 Meeting Scheduled</h2>
        </div>
        <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <h3 style="margin-top:0;color:#111827">${input.title}</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;width:130px">Customer</td><td style="padding:8px 0;color:#111827;font-weight:600">${input.customerName}</td></tr>
            ${input.contactPerson ? `<tr><td style="padding:8px 0;color:#6b7280">Contact</td><td style="padding:8px 0;color:#111827">${input.contactPerson}</td></tr>` : ''}
            <tr><td style="padding:8px 0;color:#6b7280">Date &amp; Time</td><td style="padding:8px 0;color:#111827;font-weight:600">${dateStr}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Duration</td><td style="padding:8px 0;color:#111827">${input.durationMinutes || 60} minutes</td></tr>
            ${input.location ? `<tr><td style="padding:8px 0;color:#6b7280">Location</td><td style="padding:8px 0;color:#111827">${input.location}</td></tr>` : ''}
          </table>
          ${input.notes ? `<div style="margin-top:16px;padding:12px;background:#fff;border-radius:6px;border:1px solid #e5e7eb"><strong>Notes:</strong><br>${input.notes}</div>` : ''}
          <p style="margin-top:20px;color:#6b7280;font-size:13px">A calendar invitation (.ics) is attached. Open it to add this meeting to your calendar.</p>
        </div>
      </div>
    `;

    const transport = this.getTransport();

    // Send individually so one failure doesn't block the rest
    for (const recipient of recipients) {
      try {
        await transport.sendMail({
          from,
          to: recipient,
          subject: `📅 Meeting: ${input.title} — ${input.customerName}`,
          html,
          attachments: [
            {
              filename: 'meeting.ics',
              content: ics,
              contentType: 'text/calendar; method=REQUEST',
            },
          ],
        });
        this.logger.log(`Meeting invitation sent to: ${recipient}`);
      } catch (err: any) {
        this.logger.error(`Failed to send meeting email to ${recipient}: ${err?.message}`);
      }
    }
  }
}
