import { AllConfigType } from '@/config/config.type';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AllConfigType>) => {
    cloudinary.config({
      cloud_name: configService.getOrThrow('cloudinary.cloudName', {
        infer: true,
      }),
      api_key: configService.getOrThrow('cloudinary.apiKey', { infer: true }),
      api_secret: configService.getOrThrow('cloudinary.apiSecret', {
        infer: true,
      }),
    });
    return cloudinary;
  },
};
