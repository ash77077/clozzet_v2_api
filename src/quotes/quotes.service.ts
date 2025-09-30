import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument } from './schemas/quote.schema';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { EmailService } from './email.service';

@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    @InjectModel(Quote.name) private quoteModel: Model<QuoteDocument>,
    private emailService: EmailService,
  ) {}

  async create(createQuoteDto: CreateQuoteDto): Promise<{ success: boolean; message: string; quoteId?: string }> {
    try {
      this.logger.log(`Creating new quote request from ${createQuoteDto.companyName}`);

      // Create and save the quote
      const createdQuote = new this.quoteModel(createQuoteDto);
      const savedQuote = await createdQuote.save();

      this.logger.log(`Quote saved with ID: ${savedQuote._id}`);

      // Send email notification
      await this.emailService.sendQuoteNotification(createQuoteDto);
      this.logger.log(`Email notification sent for quote ID: ${savedQuote._id}`);

      return {
        success: true,
        message: 'Quote request submitted successfully. We will get back to you within 4 hours.',
        quoteId: savedQuote._id?.toString(),
      };
    } catch (error) {
      this.logger.error(`Error creating quote: ${error.message}`, error.stack);
      
      // If email fails but quote is saved, still return success
      if (error.message.includes('email') || error.message.includes('mail')) {
        this.logger.warn('Email failed but quote was saved');
        return {
          success: true,
          message: 'Quote request submitted successfully. We will get back to you within 4 hours.',
        };
      }

      throw error;
    }
  }

  async findAll(): Promise<Quote[]> {
    return this.quoteModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Quote | null> {
    return this.quoteModel.findById(id).exec();
  }
}