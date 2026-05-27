import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { ProductDetailsService } from './product-details.service';
import { ProductDetailsDeadlineScheduler } from './product-details-deadline.scheduler';
import { CreateProductDetailsDto } from './dto/create-product-details.dto';
import { ProductDetails } from './schemas/product-details.schema';
import { multerConfig } from './config/multer.config';
import { join } from 'path';
import { existsSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('product-details')
@Controller('product-details')
export class ProductDetailsController {
  constructor(
    private readonly productDetailsService: ProductDetailsService,
    private readonly deadlineScheduler: ProductDetailsDeadlineScheduler,
  ) {}

  @Post('test-deadline-reminder')
  @HttpCode(200)
  async testDeadlineReminder(@Query('days') days?: string) {
    const daysAhead = days ? parseInt(days, 10) : 2;
    await this.deadlineScheduler.sendDeadlineReminders(daysAhead);
    return { success: true, message: `Deadline reminder check triggered for ${daysAhead} day(s) ahead` };
  }

  @Post('upload-files')
  @UseInterceptors(FilesInterceptor('files', 20, multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload design files',
    description: 'Upload logo files, design files, and reference images for product details. Maximum 20 files, 50MB each.',
  })
  @ApiResponse({
    status: 200,
    description: 'Files uploaded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - file validation failed',
  })
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<{
    success: boolean;
    message: string;
    data: {
      uploadedFiles: {
        filename: string;
        originalname: string;
        mimetype: string;
        size: number;
        path: string;
        url: string;
        publicId: string;
      }[];
    };
  }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = files.map(file => {
      // Cloudinary stores additional data in the file object
      const cloudinaryFile = file as any;

      return {
        filename: cloudinaryFile.filename || cloudinaryFile.public_id || file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: cloudinaryFile.path || cloudinaryFile.secure_url || file.path,
        url: cloudinaryFile.secure_url || cloudinaryFile.url || file.path, // Cloudinary secure URL
        publicId: cloudinaryFile.public_id || '', // Cloudinary public ID
      };
    });

    return {
      success: true,
      message: `${files.length} file(s) uploaded successfully to Cloudinary`,
      data: {
        uploadedFiles,
      },
    };
  }

  // NOTE: This endpoint is kept for backward compatibility with old local files
  // New uploads are stored in Cloudinary and accessed via direct URLs
  @Get('files/:filename')
  @ApiOperation({
    summary: 'Download uploaded file (Legacy)',
    description: 'Download a specific uploaded file by filename. For backward compatibility with old local files.',
  })
  @ApiParam({
    name: 'filename',
    description: 'Name of the file to download',
    example: 'logo-1234567890-company-logo.png',
  })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Sanitize filename to prevent directory traversal attacks
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filePath = join(__dirname, '..', '..', '..', 'uploads', 'product-details', sanitizedFilename);
      
      // Check if file exists
      if (!existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found',
        });
        return;
      }

      // Set appropriate headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // Send the file
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error downloading file',
        error: error.message,
      });
    }
  }

  // NOTE: This endpoint is kept for backward compatibility with old local files
  // New uploads are stored in Cloudinary and accessed via direct URLs
  @Get('preview/:filename')
  @ApiOperation({
    summary: 'Preview uploaded file (Legacy)',
    description: 'Display a specific uploaded file inline. For backward compatibility with old local files.',
  })
  @ApiParam({
    name: 'filename',
    description: 'Name of the file to preview',
    example: 'logo-1234567890-company-logo.png',
  })
  @ApiResponse({
    status: 200,
    description: 'File displayed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
  })
  async previewFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Sanitize filename to prevent directory traversal attacks
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filePath = join(__dirname, '..', '..', '..', 'uploads', 'product-details', sanitizedFilename);
      
      // Check if file exists
      if (!existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found',
        });
        return;
      }

      // Determine content type based on file extension
      const extension = sanitizedFilename.split('.').pop()?.toLowerCase();
      let contentType: string | number | readonly string[];
      
      switch (extension) {
        case 'png':
          contentType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'gif':
          contentType = 'image/gif';
          break;
        case 'webp':
          contentType = 'image/webp';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        case 'pdf':
          contentType = 'application/pdf';
          break;
        default:
          contentType = 'application/octet-stream';
      }

      // Set appropriate headers for inline display
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Send the file
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error previewing file',
        error: error.message,
      });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new product details',
    description: 'Creates a new product details order and sends email notification to manufacturing team',
  })
  @ApiResponse({
    status: 201,
    description: 'Product details created successfully and email sent',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  async create(
    @Body(ValidationPipe) createProductDetailsDto: CreateProductDetailsDto,
    @Req() req: any,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    // Extract user ID from JWT token
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    console.log('Creating order with user:', req.user, 'userId:', userId);

    // Add createdBy field to the DTO
    const dataWithCreatedBy = {
      ...createProductDetailsDto,
      createdBy: userId,
    };

    const productDetails = await this.productDetailsService.create(dataWithCreatedBy);

    return {
      success: true,
      message: 'Product details created successfully and email notification sent to manufacturing team',
      data: productDetails,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all product details',
    description: 'Retrieves all product details orders sorted by creation date (newest first)',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details retrieved successfully',
    type: [ProductDetails],
  })
  async findAll(): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails[];
  }> {
    const productDetails = await this.productDetailsService.findAll();
    
    return {
      success: true,
      message: 'Product details retrieved successfully',
      data: productDetails,
    };
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get product details statistics',
    description: 'Retrieves statistics about orders, priorities, and cloth types',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const statistics = await this.productDetailsService.getStatistics();
    
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: statistics,
    };
  }

  @Get('search/order/:orderNumber')
  @ApiOperation({
    summary: 'Find product details by order number',
    description: 'Retrieves product details by order number',
  })
  @ApiParam({
    name: 'orderNumber',
    description: 'Order number to search for',
    example: 'ORD-2024-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details found',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    const productDetails = await this.productDetailsService.findByOrderNumber(orderNumber);
    
    return {
      success: true,
      message: 'Product details found',
      data: productDetails,
    };
  }

  @Get('search/client')
  @ApiOperation({
    summary: 'Find product details by client name',
    description: 'Retrieves product details by client name (case-insensitive partial match)',
  })
  @ApiQuery({
    name: 'name',
    description: 'Client name to search for',
    example: 'Tech Corp',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details found',
    type: [ProductDetails],
  })
  async findByClient(
    @Query('name') clientName: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails[];
  }> {
    const productDetails = await this.productDetailsService.findByClient(clientName);
    
    return {
      success: true,
      message: `Found ${productDetails.length} orders for client: ${clientName}`,
      data: productDetails,
    };
  }

  @Get('search/priority/:priority')
  @ApiOperation({
    summary: 'Find product details by priority',
    description: 'Retrieves product details by priority level',
  })
  @ApiParam({
    name: 'priority',
    description: 'Priority level',
    enum: ['low', 'normal', 'high', 'urgent'],
  })
  @ApiResponse({
    status: 200,
    description: 'Product details found',
    type: [ProductDetails],
  })
  async findByPriority(
    @Param('priority') priority: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails[];
  }> {
    const productDetails = await this.productDetailsService.findByPriority(priority);
    
    return {
      success: true,
      message: `Found ${productDetails.length} orders with ${priority} priority`,
      data: productDetails,
    };
  }

  @Get('search/cloth-type/:clothType')
  @ApiOperation({
    summary: 'Find product details by cloth type',
    description: 'Retrieves product details by cloth type',
  })
  @ApiParam({
    name: 'clothType',
    description: 'Cloth type',
    example: 't-shirts',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details found',
    type: [ProductDetails],
  })
  async findByClothType(
    @Param('clothType') clothType: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails[];
  }> {
    const productDetails = await this.productDetailsService.findByClothType(clothType);
    
    return {
      success: true,
      message: `Found ${productDetails.length} orders for ${clothType}`,
      data: productDetails,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product details by ID',
    description: 'Retrieves a specific product details by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product details ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details found',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    const productDetails = await this.productDetailsService.findOne(id);
    
    return {
      success: true,
      message: 'Product details found',
      data: productDetails,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update product details',
    description: 'Updates product details with partial data',
  })
  @ApiParam({
    name: 'id',
    description: 'Product details ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Product details updated successfully',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateProductDetailsDto>,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    const productDetails = await this.productDetailsService.update(id, updateData);

    return {
      success: true,
      message: 'Product details updated successfully',
      data: productDetails,
    };
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update product details status',
    description: 'Updates the status of product details order',
  })
  @ApiParam({
    name: 'id',
    description: 'Product details ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Status updated successfully',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { status: string },
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    const productDetails = await this.productDetailsService.updateStatus(
      id,
      updateStatusDto.status,
    );

    return {
      success: true,
      message: 'Status updated successfully',
      data: productDetails,
    };
  }

  @Patch(':id/manufacturing-status')
  @ApiOperation({
    summary: 'Update manufacturing status',
    description: 'Updates the manufacturing status of a product details order',
  })
  @ApiParam({
    name: 'id',
    description: 'Product details ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Manufacturing status updated successfully',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async updateManufacturingStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: { manufacturingStatus: string; updatedBy?: string },
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    const productDetails = await this.productDetailsService.updateManufacturingStatus(
      id,
      updateStatusDto.manufacturingStatus,
      updateStatusDto.updatedBy,
    );
    
    return {
      success: true,
      message: 'Manufacturing status updated successfully',
      data: productDetails,
    };
  }

  @Post(':id/manufacturing-notes')
  @ApiOperation({
    summary: 'Add manufacturing notes',
    description: 'Adds manufacturing notes to a product details order',
  })
  @ApiParam({
    name: 'id',
    description: 'Product details ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Manufacturing notes added successfully',
    type: ProductDetails,
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async addManufacturingNotes(
    @Param('id') id: string,
    @Body() notesDto: { content: string; author: string },
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails;
  }> {
    const productDetails = await this.productDetailsService.addManufacturingNotes(
      id,
      notesDto.content,
      notesDto.author,
    );
    
    return {
      success: true,
      message: 'Manufacturing notes added successfully',
      data: productDetails,
    };
  }

  @Get('manufacturing/status/:status')
  @ApiOperation({
    summary: 'Find orders by manufacturing status',
    description: 'Retrieves product details by manufacturing status',
  })
  @ApiParam({
    name: 'status',
    description: 'Manufacturing status',
    enum: ['pending', 'waiting_for_info', 'in_progress', 'printing', 'quality_check', 'packaging', 'done', 'on_hold'],
  })
  @ApiResponse({
    status: 200,
    description: 'Orders found',
    type: [ProductDetails],
  })
  async findByManufacturingStatus(
    @Param('status') status: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: ProductDetails[];
  }> {
    const productDetails = await this.productDetailsService.findByManufacturingStatus(status);
    
    return {
      success: true,
      message: `Found ${productDetails.length} orders with manufacturing status: ${status}`,
      data: productDetails,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product details',
    description: 'Deletes a specific product details order',
  })
  @ApiParam({
    name: 'id',
    description: 'Product details ID',
  })
  @ApiResponse({
    status: 204,
    description: 'Product details deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product details not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productDetailsService.delete(id);
  }
}
