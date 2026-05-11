import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
dotenv.config({ path: join(__dirname, '..', '..', '..', '.env') });

// Configure Cloudinary with explicit env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'deqpkdp51',
  api_key: process.env.CLOUDINARY_API_KEY || '993128255216663',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WV9BxNLc_Q8eUCJiyHUY5zWtWFM',
  secure: true, // Use HTTPS
});

// Log configuration for debugging (remove in production)
const config = cloudinary.config();
console.log('Cloudinary Config:', {
  cloud_name: config.cloud_name,
  api_key: config.api_key ? '***' + config.api_key.slice(-4) : 'missing',
});

// Create Cloudinary storage for Multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'clozzet/product-details',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'ai', 'psd', 'xlsx', 'xls', 'doc', 'docx'],
    resource_type: 'auto',
    public_id: (req, file) => `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
  } as any,
});

export { cloudinary };