import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a quote request' })
  @ApiResponse({
    status: 201,
    description: 'Quote request submitted successfully',
    schema: {
      example: {
        success: true,
        message: 'Quote request submitted successfully. We will get back to you within 4 hours.',
        quoteId: '507f1f77bcf86cd799439011'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async create(@Body() createQuoteDto: CreateQuoteDto) {
    this.logger.log(`Received quote request from ${createQuoteDto.email}`);
    
    try {
      const result = await this.quotesService.create(createQuoteDto);
      this.logger.log(`Quote request processed successfully for ${createQuoteDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`Error processing quote request: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Sorry, there was an error processing your request. Please try again or contact us directly.',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all quote requests (for admin use)' })
  @ApiResponse({
    status: 200,
    description: 'List of all quote requests',
  })
  async findAll() {
    return this.quotesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific quote request by ID (for admin use)' })
  @ApiResponse({
    status: 200,
    description: 'Quote request details',
  })
  @ApiResponse({
    status: 404,
    description: 'Quote request not found',
  })
  async findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }
}