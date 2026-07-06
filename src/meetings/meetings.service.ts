import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingStatus } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<Meeting>,
  ) {}

  async create(dto: CreateMeetingDto, userId?: string, createdByName?: string): Promise<Meeting> {
    const data: any = { ...dto };
    if (userId) data.createdBy = new Types.ObjectId(userId);
    if (createdByName) data.createdByName = createdByName;
    if (dto.customerId) data.customerId = new Types.ObjectId(dto.customerId);
    const meeting = new this.meetingModel(data);
    return meeting.save();
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

  async updateStatus(id: string, status: MeetingStatus): Promise<Meeting> {
    return this.update(id, { status } as any);
  }

  async delete(id: string): Promise<void> {
    const result = await this.meetingModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Meeting ${id} not found`);
  }
}
