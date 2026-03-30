import { Uuid } from '@/common/types/common.type';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MediaResourceType } from '../entities/media.entity';

export class MediaResDto {
  @ApiProperty()
  @Expose()
  id!: Uuid;

  @ApiProperty()
  @Expose()
  cloudinaryPublicId!: string;

  @ApiProperty()
  @Expose()
  url!: string;

  @ApiPropertyOptional()
  @Expose()
  filename: string | null;

  @ApiProperty({ enum: MediaResourceType })
  @Expose()
  resourceType!: MediaResourceType;

  @ApiPropertyOptional()
  @Expose()
  folder: string | null;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}
