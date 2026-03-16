import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get, Param, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('mockups', 10))
  @ApiConsumes('multipart/form-data', 'application/json')
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
  async create(
    @Body() body: any,
    @UploadedFiles() files?: Array<Express.Multer.File>
  ) {
    this.logger.log(`Received quote request from ${body.email}`);

    try {
      // Transform the data from FormData to DTO
      const createQuoteDto: CreateQuoteDto = {
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        productType: body.productType,
        quantity: parseInt(body.quantity, 10), // Convert string to number
        message: body.message || undefined,
      };

      // Log uploaded files
      if (files && files.length > 0) {
        this.logger.log(`Received ${files.length} file(s): ${files.map(f => f.originalname).join(', ')}`);
      }

      const result = await this.quotesService.create(createQuoteDto, files);
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