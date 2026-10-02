import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Interaction } from './schemas/interaction.schema';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Interaction.name)
    private readonly interactionModel: Model<Interaction>,
    @Inject(forwardRef(() => CustomersService))
    private readonly customersService: CustomersService,
  ) {}

  async create(
    createInteractionDto: CreateInteractionDto,
    userId?: string,
    createdByName?: string,
  ): Promise<Interaction> {
    // Verify customer exists
    await this.customersService.findById(createInteractionDto.customerId);

    const interactionData: any = {
      ...createInteractionDto,
      customerId: new Types.ObjectId(createInteractionDto.customerId),
    };

    // Add createdBy if userId provided
    if (userId) {
      interactionData.createdBy = new Types.ObjectId(userId);
    }

    // Add createdByName for imported data
    if (createdByName) {
      interactionData.createdByName = createdByName;
    } else if (!userId) {
      // Default name for imports without a user
      interactionData.createdByName = 'Toma Babayan';
    }

    const interaction = new this.interactionModel(interactionData);
    const savedInteraction = await interaction.save();

    // Update customer's last contacted date
    await this.customersService.updateLastContacted(createInteractionDto.customerId);

    // Update next follow-up date if provided; otherwise clear the overdue
    if (createInteractionDto.nextFollowUpDate) {
      await this.customersService.update(createInteractionDto.customerId, {
        nextFollowUpAt: createInteractionDto.nextFollowUpDate,
      });
    } else {
      await this.clearFollowUpOverdue(createInteractionDto.customerId);
    }

    return savedInteraction;
  }

  async findByCustomer(customerId: string): Promise<Interaction[]> {
    return await this.interactionModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ interactionDate: -1 })
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async findAll(): Promise<Interaction[]> {
    return await this.interactionModel
      .find()
      .sort({ interactionDate: -1 })
      .populate('customerId', 'companyName contactPerson')
      .populate('createdBy', 'firstName lastName email')
      .exec();
  }

  async findById(id: string): Promise<Interaction> {
    const interaction = await this.interactionModel
      .findById(id)
      .populate('customerId', 'companyName contactPerson phone email')
      .populate('createdBy', 'firstName lastName email')
      .exec();

    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }

    return interaction;
  }

  async findPendingFollowUps(): Promise<Interaction[]> {
    const today = new Date();
    return await this.interactionModel
      .find({
        nextFollowUpDate: { $lte: today },
        isFollowUpCompleted: false,
      })
      .sort({ nextFollowUpDate: 1 })
      .populate('customerId', 'companyName contactPerson phone')
      .exec();
  }

  async update(id: string, updateData: any): Promise<Interaction> {
    const interaction = await this.interactionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }

    return interaction;
  }

  async createInternal(data: {
    customerId: string;
    type: string;
    summary: string;
    subject?: string;
    interactionDate?: Date;
    createdByName?: string;
    createdBy?: string;
  }): Promise<void> {
    const doc: any = {
      customerId: new Types.ObjectId(data.customerId),
      type: data.type,
      summary: data.summary,
      subject: data.subject,
      interactionDate: data.interactionDate ?? new Date(),
      isFollowUpCompleted: false,
    };
    if (data.createdBy) doc.createdBy = new Types.ObjectId(data.createdBy);
    if (data.createdByName) doc.createdByName = data.createdByName;
    await new this.interactionModel(doc).save();
    await this.customersService.updateLastContacted(data.customerId);
  }

  async clearFollowUpOverdue(customerId: string): Promise<void> {
    await this.interactionModel.updateMany(
      {
        customerId: new Types.ObjectId(customerId),
        isFollowUpCompleted: false,
        nextFollowUpDate: { $exists: true, $ne: null },
      },
      { isFollowUpCompleted: true },
    );
    await this.customersService.update(customerId, { nextFollowUpAt: null });
  }

  async markFollowUpCompleted(id: string): Promise<Interaction> {
    const interaction = await this.interactionModel
      .findByIdAndUpdate(
        id,
        { isFollowUpCompleted: true },
        { new: true },
      )
      .exec();

    if (!interaction) {
      throw new NotFoundException(`Interaction with ID ${id} not found`);
    }

    return interaction;
  }
}
