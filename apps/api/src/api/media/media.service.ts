import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { paginate } from '@/utils/offset-pagination';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { UploadApiResponse, v2 as CloudinaryType } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Repository } from 'typeorm';
import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { CLOUDINARY } from './cloudinary.provider';
import { MediaResDto } from './dto/media.res.dto';
import { MediaEntity, MediaResourceType } from './entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepo: Repository<MediaEntity>,
    @Inject(CLOUDINARY)
    private readonly cloudinary: typeof CloudinaryType,
  ) {}

  /** Admin: upload file to Cloudinary, persist record */
  async upload(file: Express.Multer.File, folder?: string): Promise<MediaResDto> {
    if (!file) throw new BadRequestException('No file provided');

    const uploadResult = await this.uploadToCloudinary(file, folder ?? 'longnhan');
    const media = this.mediaRepo.create({
      cloudinaryPublicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      filename: file.originalname ?? null,
      resourceType: (uploadResult.resource_type as MediaResourceType) ?? MediaResourceType.IMAGE,
      folder: folder ?? null,
    });
    const saved = await this.mediaRepo.save(media);
    return plainToInstance(MediaResDto, saved, { excludeExtraneousValues: true });
  }

  /** Admin: list media */
  async findMany(dto: PageOptionsDto): Promise<OffsetPaginatedDto<MediaResDto>> {
    const qb = this.mediaRepo
      .createQueryBuilder('media')
      .orderBy('media.createdAt', 'DESC');

    const [items, meta] = await paginate(qb, dto, { skipCount: false, takeAll: false });
    return new OffsetPaginatedDto(
      plainToInstance(MediaResDto, items, { excludeExtraneousValues: true }),
      meta,
    );
  }

  /** Admin: delete from DB first, then Cloudinary (DB failure won't leave orphaned Cloudinary asset) */
  async remove(id: Uuid): Promise<void> {
    const media = await this.mediaRepo.findOneBy({ id });
    if (!media) throw new NotFoundException('Media not found');

    // Remove from DB first — if Cloudinary fails after, record is gone but asset remains (acceptable trade-off)
    await this.mediaRepo.remove(media);

    await this.cloudinary.uploader.destroy(media.cloudinaryPublicId, {
      resource_type: media.resourceType,
    });
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder, resource_type: 'auto', timeout: 30000 },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload returned no result'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
