import { Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { InteractionsService } from '../interactions/interactions.service';
import { GoogleCalendarService } from './google-calendar.service';
import { MeetingNotificationService } from './meeting-notification.service';

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<Meeting>,
    @Inject(forwardRef(() => InteractionsService))
    private readonly interactionsService: InteractionsService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly meetingNotificationService: MeetingNotificationService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateMeetingDto, userId?: string, createdByName?: string): Promise<Meeting> {
    const data: any = { ...dto };
    if (userId) data.createdBy = new Types.ObjectId(userId);
    if (createdByName) data.createdByName = createdByName;
    if (dto.customerId) data.customerId = new Types.ObjectId(dto.customerId);
    const meeting = new this.meetingModel(data);
    const saved = await meeting.save();

    if (dto.customerId) {
      await this.interactionsService.clearFollowUpOverdue(dto.customerId);
      const dateLabel = new Date(dto.meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      await this.interactionsService.createInternal({
        customerId: dto.customerId,
        type: 'In-person',
        subject: 'Meeting Scheduled',
        summary: `Meeting "${dto.title}" scheduled for ${dateLabel}.${dto.notes ? ' Notes: ' + dto.notes : ''}`,
        createdByName,
        createdBy: userId,
      });
    }

    // Fire-and-forget: Google Calendar + email (don't block the response)
    this.createCalendarEvent(saved, dto);
    this.sendMeetingNotifications(saved, dto);

    return saved;
  }

  private createCalendarEvent(meeting: Meeting, dto: CreateMeetingDto): void {
    const meetingDate = new Date(dto.meetingDate);
    const durationMinutes = dto.duration ?? 60;

    this.googleCalendarService.createEvent({
      title: dto.title,
      description: [
        `Customer: ${dto.customerName}`,
        dto.contactPerson ? `Contact: ${dto.contactPerson}` : '',
        dto.notes ? `Notes: ${dto.notes}` : '',
      ].filter(Boolean).join('\n'),
      location: dto.address,
      startTime: meetingDate,
      durationMinutes,
    }).then(eventId => {
      if (eventId) {
        return this.meetingModel.findByIdAndUpdate(meeting._id, { googleEventId: eventId }).exec();
      }
    }).catch(err => {
      this.logger.error(`Google Calendar event creation failed: ${err?.message}`);
    });
  }

  private sendMeetingNotifications(meeting: Meeting, dto: CreateMeetingDto): void {
    const internalEmails = (this.configService.get<string>('MEETING_INVITE_EMAILS') ?? '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);

    const toEmails = [...internalEmails];
    if (dto.inviteCustomer && dto.customerEmail) {
      toEmails.push(dto.customerEmail);
    }

    this.logger.log(`Sending meeting invitations to: ${toEmails.join(', ')}`);

    this.meetingNotificationService.sendInvitations({
      title: dto.title,
      customerName: dto.customerName,
      contactPerson: dto.contactPerson,
      meetingDate: new Date(dto.meetingDate),
      durationMinutes: dto.duration ?? 60,
      location: dto.address,
      notes: dto.notes,
      toEmails,
    }).catch(err => {
      this.logger.error(`Meeting notification failed: ${err?.message}`);
    });
  }

  async findByCustomer(customerId: string): Promise<Meeting[]> {
    return this.meetingModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ meetingDate: -1 })
      .exec();
  }

  async findAll(): Promise<Meeting[]> {
    return this.meetingModel
      .find()
      .sort({ meetingDate: -1 })
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async findById(id: string): Promise<Meeting> {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    return meeting;
  }

  async update(id: string, updateData: Partial<CreateMeetingDto>): Promise<Meeting> {
    const meeting = await this.meetingModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    return meeting;
  }

  async updateStatus(id: string, status: MeetingStatus, userId?: string): Promise<Meeting> {
    const meeting = await this.update(id, { status } as any);
    if (meeting.customerId) {
      const customerId = String(meeting.customerId);
      if (status === MeetingStatus.COMPLETED) {
        await this.interactionsService.clearFollowUpOverdue(customerId);
        await this.interactionsService.createInternal({
          customerId,
          type: 'In-person',
          subject: 'Meeting Completed',
          summary: `Meeting "${meeting.title}" was marked as completed.`,
          createdBy: userId,
        });
      } else if (status === MeetingStatus.CANCELLED || status === MeetingStatus.NO_SHOW) {
        // Delete Google Calendar event if exists
        if (meeting.googleEventId) {
          this.googleCalendarService.deleteEvent(meeting.googleEventId).catch(() => {});
        }
        await this.interactionsService.createInternal({
          customerId,
          type: 'In-person',
          subject: `Meeting ${status === MeetingStatus.CANCELLED ? 'Cancelled' : 'No-show'}`,
          summary: `Meeting "${meeting.title}" was marked as ${status.replace('_', '-')}.`,
          createdBy: userId,
        });
      }
    }
    return meeting;
  }

  async delete(id: string): Promise<void> {
    const meeting = await this.meetingModel.findById(id).exec();
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    if (meeting.googleEventId) {
      this.googleCalendarService.deleteEvent(meeting.googleEventId).catch(() => {});
    }
    await this.meetingModel.findByIdAndDelete(id).exec();
  }
}
