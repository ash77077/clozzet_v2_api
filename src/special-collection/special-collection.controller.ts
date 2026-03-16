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
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { SpecialCollectionService } from './special-collection.service';
import { CreateSpecialCollectionDto } from './dto/create-special-collection.dto';
import { UpdateSpecialCollectionDto } from './dto/update-special-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { specialCollectionImageConfig } from './config/multer.config';

@Controller('special-collection')
export class SpecialCollectionController {
  constructor(private readonly service: SpecialCollectionService) {}

  // ──────────────────────── Public routes ────────────────────────

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.service.findByCategory(category);
  }

  /** Serve a stored image file (public) */
  @Get('image/:filename')
  async getImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'special-collection',
      sanitized,
    );

    if (!existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Image not found' });
      return;
    }

    const ext = sanitized.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
    };
    const contentType = contentTypeMap[ext ?? ''] ?? 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(filePath);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // ──────────────────────── Admin-only: list ────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.service.findAllAdmin();
  }

  // ──────────────────────── Admin CRUD ────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateSpecialCollectionDto) {
    return this.service.create(dto);
  }

  /** Upload a single image; returns the stored filename */
  @Post('upload-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', specialCollectionImageConfig))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
      },
    };
  }

  /** Delete an image file from disk (admin) */
  @Delete('image/:filename')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteImage(@Param('filename') filename: string) {
    const sanitized = filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const filePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'special-collection',
      sanitized,
    );

    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    return { success: true, message: 'Image deleted' };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateSpecialCollectionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
