import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { PageOptionsDto } from '@/common/dto/offset-pagination/page-options.dto';
import { Uuid } from '@/common/types/common.type';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { MediaResDto } from './dto/media.res.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiAuth({ type: MediaResDto, summary: 'Upload file to Cloudinary (admin)', statusCode: 201 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'products' },
      },
    },
  })
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
        }
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<MediaResDto> {
    return this.mediaService.upload(file, folder);
  }

  @ApiAuth({ type: MediaResDto, summary: 'List media (admin)', isPaginated: true })
  @Get()
  async findMany(@Query() dto: PageOptionsDto): Promise<OffsetPaginatedDto<MediaResDto>> {
    return this.mediaService.findMany(dto);
  }

  @ApiAuth({ summary: 'Delete media (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: Uuid): Promise<void> {
    return this.mediaService.remove(id);
  }
}
