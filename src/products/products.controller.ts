import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { variantImageConfig } from './config/multer.config';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoint - get all active products
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  // Admin endpoints - require admin role (must come before :id route)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.productsService.findAllAdmin();
  }

  @Post('upload-variant-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', variantImageConfig))
  async uploadVariantImage(@UploadedFile() file: Express.Multer.File): Promise<{
    success: boolean;
    message: string;
    data: {
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
      path: string;
    };
  }> {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    return {
      success: true,
      message: 'Variant image uploaded successfully',
      data: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
    };
  }

  @Get('variant-image/:filename')
  async getVariantImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Sanitize filename to prevent directory traversal attacks
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filePath = join(__dirname, '..', '..', '..', 'uploads', 'variants', sanitizedFilename);

      // Check if file exists
      if (!existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Image not found',
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
        message: 'Error retrieving image',
        error: error.message,
      });
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Public endpoint - get single product (must come after specific routes)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  toggleActive(@Param('id') id: string) {
    return this.productsService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
