import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(__dirname, '..', '..', '..', 'uploads', 'product-details');
      
      // Ensure the upload directory exists
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Allow images and common design files
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'application/postscript', // .ai files
      'application/illustrator', // .ai files
      'image/x-adobe-dng', // .ai files alternative
      'application/x-photoshop', // .psd files
      'image/vnd.adobe.photoshop', // .psd files
      'application/x-indesign', // .indd files
      'application/zip', // for compressed design files
      'application/x-rar-compressed',
      'application/vnd.ms-excel', // .xls files
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx files
      'text/plain', // .txt files
      'application/msword', // .doc files
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx files
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload image files (.jpg, .png, .gif, .svg) or design files (.ai, .psd, .pdf)`), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
};