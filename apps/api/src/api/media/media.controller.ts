import { OffsetPaginatedDto } from '@/common/dto/offset-pagination/paginated.dto';
import { Uuid } from '@/common/types/common.type';
import { ApiAuth } from '@/decorators/http.decorators';
import {
  BadRequestException,
  Body,
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
import { CreateMediaFolderReqDto } from './dto/create-media-folder.req.dto';
import { MediaFolderResDto } from './dto/media-folder.res.dto';
import { MediaQueryReqDto } from './dto/media-query.req.dto';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller({ path: 'media', version: '1' })
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiAuth({
    type: MediaResDto,
    summary: 'Upload file to Cloudinary (admin)',
    statusCode: 201,
  })
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
        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'video/mp4',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(`Unsupported file type: ${file.mimetype}`),
            false,
          );
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

  @ApiAuth({
    type: MediaResDto,
    summary: 'List media (admin)',
    isPaginated: true,
  })
  @Get()
  async findMany(
    @Query() dto: MediaQueryReqDto,
  ): Promise<OffsetPaginatedDto<MediaResDto>> {
    return this.mediaService.findMany(dto);
  }

  @ApiAuth({
    type: MediaFolderResDto,
    summary: 'List media folders (admin)',
  })
  @Get('folders')
  async listFolders(): Promise<MediaFolderResDto[]> {
    return this.mediaService.listFolders();
  }

  @ApiAuth({
    type: MediaFolderResDto,
    summary: 'Create media folder (admin)',
    statusCode: HttpStatus.CREATED,
  })
  @Post('folders')
  @HttpCode(HttpStatus.CREATED)
  async createFolder(
    @Body() dto: CreateMediaFolderReqDto,
  ): Promise<MediaFolderResDto> {
    return this.mediaService.createFolder(dto.name);
  }

  @ApiAuth({ summary: 'Delete media folder (admin)' })
  @Delete('folders/:name')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFolder(@Param('name') name: string): Promise<void> {
    return this.mediaService.deleteFolder(decodeURIComponent(name));
  }

  @ApiAuth({ summary: 'Delete media (admin)' })
  @ApiParam({ name: 'id', type: 'String' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: Uuid): Promise<void> {
    return this.mediaService.remove(id);
  }
}
