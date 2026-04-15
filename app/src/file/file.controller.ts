import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileService } from './file.service';
import { UploadFileDto, AssembleChunksDto } from './dto/upload-file.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/types/user.type';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file (binary)' })
  async uploadBinary(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: User },
  ) {
    return this.fileService.saveFromBuffer(
      req.user,
      file.originalname,
      file.buffer,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Upload a file or chunk (base64)' })
  async upload(
    @Body() uploadFileDto: UploadFileDto,
    @Req() req: Request & { user: User },
  ) {
    if (
      uploadFileDto.chunkIndex !== undefined &&
      uploadFileDto.totalChunks !== undefined
    ) {
      const buffer = Buffer.from(uploadFileDto.content || '', 'base64');
      return this.fileService.saveChunk(
        req.user,
        uploadFileDto.filename,
        buffer,
        uploadFileDto.chunkIndex,
        uploadFileDto.totalChunks,
      );
    }

    const buffer = Buffer.from(uploadFileDto.content || '', 'base64');
    return this.fileService.saveFromBuffer(
      req.user,
      uploadFileDto.filename,
      buffer,
    );
  }

  @Post('assemble')
  @ApiOperation({ summary: 'Assemble chunks into final file' })
  async assembleChunks(
    @Body() assembleDto: AssembleChunksDto,
    @Req() req: Request & { user: User },
  ) {
    return this.fileService.assembleChunks(
      req.user,
      assembleDto.filename,
      assembleDto.totalChunks,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  async findAll(@Req() req: Request & { user: User }) {
    return this.fileService.getFilesWithMetadata(req.user);
  }

  @Get(':filename')
  @ApiOperation({ summary: 'Download/view file' })
  async findOne(
    @Param('filename') filename: string,
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ) {
    const filePath = await this.fileService.getFilePath(req.user.id, filename);
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      txt: 'text/plain',
      html: 'text/html',
      htm: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
      json: 'application/json',
      xml: 'application/xml',
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      webp: 'image/webp',
      ico: 'image/x-icon',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      mp4: 'video/mp4',
      webm: 'video/webm',
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  }

  @Delete(':filename')
  @ApiOperation({ summary: 'Delete a file' })
  async remove(
    @Param('filename') filename: string,
    @Req() req: Request & { user: User },
  ) {
    await this.fileService.deleteFile(req.user, filename);
    return { message: 'File deleted' };
  }
}
