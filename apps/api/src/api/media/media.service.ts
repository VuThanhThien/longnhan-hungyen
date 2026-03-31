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
import { v2 as CloudinaryType, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Repository } from 'typeorm';
import { CLOUDINARY } from './cloudinary.provider';
import { MediaFolderResDto } from './dto/media-folder.res.dto';
import { MediaQueryReqDto } from './dto/media-query.req.dto';
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
  async upload(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<MediaResDto> {
    if (!file) throw new BadRequestException('No file provided');

    const uploadResult = await this.uploadToCloudinary(
      file,
      folder ?? 'longnhan',
    );
    const media = this.mediaRepo.create({
      cloudinaryPublicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      filename: file.originalname ?? null,
      resourceType:
        (uploadResult.resource_type as MediaResourceType) ??
        MediaResourceType.IMAGE,
      folder: folder ?? null,
    });
    const saved = await this.mediaRepo.save(media);
    return plainToInstance(MediaResDto, saved, {
      excludeExtraneousValues: true,
    });
  }

  /** Admin: list media */
  async findMany(
    dto: MediaQueryReqDto,
  ): Promise<OffsetPaginatedDto<MediaResDto>> {
    const qb = this.mediaRepo
      .createQueryBuilder('media')
      .orderBy('media.createdAt', 'DESC');
    if (dto.folder) {
      qb.andWhere('media.folder = :folder', { folder: dto.folder });
    }

    const [items, meta] = await paginate(qb, dto, {
      skipCount: false,
      takeAll: false,
    });
    return new OffsetPaginatedDto(
      plainToInstance(MediaResDto, items, { excludeExtraneousValues: true }),
      meta,
    );
  }

  async listFolders(): Promise<MediaFolderResDto[]> {
    const rows = await this.mediaRepo
      .createQueryBuilder('media')
      .select('media.folder', 'name')
      .addSelect('COUNT(media.id)', 'itemCount')
      .where('media.folder IS NOT NULL')
      .andWhere("TRIM(media.folder) <> ''")
      .groupBy('media.folder')
      .orderBy('media.folder', 'ASC')
      .getRawMany<{ name: string; itemCount: string }>();

    return rows.map((row) =>
      plainToInstance(MediaFolderResDto, {
        name: row.name,
        itemCount: Number(row.itemCount),
      }),
    );
  }

  async createFolder(name: string): Promise<MediaFolderResDto> {
    const folder = this.normalizeFolderName(name);
    try {
      await this.cloudinary.api.create_folder(folder);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (!message.toLowerCase().includes('already exists')) {
        throw error;
      }
    }

    const count = await this.mediaRepo.count({ where: { folder } });
    return plainToInstance(MediaFolderResDto, {
      name: folder,
      itemCount: count,
    });
  }

  async deleteFolder(name: string): Promise<void> {
    const folder = this.normalizeFolderName(name);
    const itemCount = await this.mediaRepo.count({ where: { folder } });
    if (itemCount > 0) {
      throw new BadRequestException('Folder is not empty');
    }

    try {
      await this.cloudinary.api.delete_folder(folder);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (!message.toLowerCase().includes('not found')) {
        throw error;
      }
    }
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

  private normalizeFolderName(raw: string): string {
    const normalized = raw.trim().replace(/^\/+|\/+$/g, '');
    if (!normalized) {
      throw new BadRequestException('Folder name is required');
    }

    const isValid = /^[a-zA-Z0-9/_-]+$/.test(normalized);
    if (!isValid) {
      throw new BadRequestException('Folder name contains invalid characters');
    }

    return normalized;
  }
}
