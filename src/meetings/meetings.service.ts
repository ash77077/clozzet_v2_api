import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { InteractionsService } from '../interactions/interactions.service';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<Meeting>,
    @Inject(forwardRef(() => InteractionsService))
    private readonly interactionsService: InteractionsService,
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
        createdByName: createdByName,
        createdBy: userId,
      });
    }
    return saved;
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
    const result = await this.meetingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Meeting ${id} not found`);
  }
}
