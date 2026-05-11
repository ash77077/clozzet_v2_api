import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { cloudinaryStorage } from './cloudinary.config';

export const multerConfig: MulterOptions = {
  storage: cloudinaryStorage,
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