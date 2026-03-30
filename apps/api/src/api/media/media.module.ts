import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from './cloudinary.provider';
import { MediaEntity } from './entities/media.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [CloudinaryProvider, MediaService],
  exports: [MediaService],
})
export class MediaModule {}
