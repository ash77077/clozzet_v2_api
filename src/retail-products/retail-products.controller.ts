
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
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { RetailProductsService } from './retail-products.service';
import { CreateRetailProductDto } from './dto/create-retail-product.dto';
import { UpdateRetailProductDto } from './dto/update-retail-product.dto';
import { SellVariantDto } from './dto/sell-variant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { retailProductImageConfig } from './config/multer.config';
import { join } from 'path';
import { existsSync } from 'fs';

@Controller('retail-products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class RetailProductsController {
  constructor(private readonly retailProductsService: RetailProductsService) {}

  @Post()
  create(@Body() createRetailProductDto: CreateRetailProductDto) {
    return this.retailProductsService.create(createRetailProductDto);
  }

  @Get()
  findAll() {
    return this.retailProductsService.findAll();
  }

  @Get('available')
  findAvailable() {
    return this.retailProductsService.findAvailable();
  }

  @Get('sold')
  findSold() {
    return this.retailProductsService.findSold();
  }

  @Get('sales/all')
  getAllSales() {
    return this.retailProductsService.getAllSales();
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', retailProductImageConfig))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{
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
      message: 'Image uploaded successfully',
      data: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
    };
  }

  @Get('image/:filename')
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Sanitize filename to prevent directory traversal attacks
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const filePath = join(__dirname, '..', '..', '..', 'uploads', 'retail-products', sanitizedFilename);

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.retailProductsService.findOne(id);
  }

  @Get(':id/sales-report')
  getSalesReport(@Param('id') id: string) {
    return this.retailProductsService.getSalesReport(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRetailProductDto: UpdateRetailProductDto) {
    return this.retailProductsService.update(id, updateRetailProductDto);
  }

  @Post(':id/sell-variant')
  sellVariant(@Param('id') id: string, @Body() sellVariantDto: SellVariantDto) {
    return this.retailProductsService.sellVariant(id, sellVariantDto);
  }

  @Post(':id/restock-variant')
  restockVariant(
    @Param('id') id: string,
    @Query('size') size: string,
    @Query('color') color: string,
    @Query('quantity') quantity: number,
  ) {
    return this.retailProductsService.restockVariant(id, size, color, quantity);
  }

  @Post(':productId/return-sale/:saleId')
  returnSale(
    @Param('productId') productId: string,
    @Param('saleId') saleId: string,
  ) {
    return this.retailProductsService.returnSale(productId, saleId);
  }

  @Patch(':productId/update-sale-price/:saleId')
  updateSalePrice(
    @Param('productId') productId: string,
    @Param('saleId') saleId: string,
    @Body('newPrice') newPrice: number,
  ) {
    return this.retailProductsService.updateSalePrice(productId, saleId, newPrice);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.retailProductsService.remove(id);
  }
}
