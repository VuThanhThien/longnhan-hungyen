import { registerAs } from '@nestjs/config';
import { CloudinaryConfig } from './cloudinary-config.type';

export default registerAs<CloudinaryConfig>('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  apiKey: process.env.CLOUDINARY_API_KEY ?? '',
  apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
}));
