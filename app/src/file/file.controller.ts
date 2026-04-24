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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileService } from './file.service';
import { UploadFileDto, AssembleChunksDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { diskStorage } from 'multer';
import * as path from 'path';

@ApiTags('files')
@ApiBearerAuth()
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage/files',
        filename: (req, file, cb) => {
          const user = (req as any).user;
          cb(null, `${user?.id || 'default'}/${file.originalname}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Upload file' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request & { user: UserEntity },
  ) {
    return this.fileService.saveFromBuffer(
      req.user,
      file.originalname,
      file.buffer,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload file (base64)' })
  async uploadBase64(
    @Body() dto: UploadFileDto,
    @Req() req: Request & { user: UserEntity },
  ) {
    const buffer = Buffer.from(dto.content || '', 'base64');
    return this.fileService.saveFromBuffer(req.user, dto.filename, buffer);
  }

  @Post('assemble')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Assemble chunks' })
  async assemble(
    @Body() dto: AssembleChunksDto,
    @Req() req: Request & { user: UserEntity },
  ) {
    return this.fileService.assembleChunks(
      req.user,
      dto.filename,
      dto.totalChunks,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my files' })
  async findAll(@Req() req: Request & { user: UserEntity }) {
    return this.fileService.getFilesWithMetadata(req.user);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user files (admin only)' })
  async findUserFiles(@Param('userId') userId: string) {
    const user = { id: userId } as UserEntity;
    return this.fileService.getFilesWithMetadata(user);
  }

  @Get(':filename')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my file' })
  async findOne(
    @Param('filename') filename: string,
    @Req() req: Request & { user: UserEntity },
  ) {
    const stream = this.fileService.getFileStream(req.user, filename);
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.svg': 'image/svg+xml',
    };
    const res = req as any;
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    stream.pipe(res);
  }

  @Delete(':filename')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete my file' })
  async remove(
    @Param('filename') filename: string,
    @Req() req: Request & { user: UserEntity },
  ) {
    await this.fileService.deleteFile(req.user, filename);
    return { message: 'File deleted' };
  }

  @Delete('user/:userId/:filename')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user file (admin only)' })
  async removeUserFile(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
  ) {
    const user = { id: userId } as UserEntity;
    await this.fileService.deleteFile(user, filename);
    return { message: 'File deleted' };
  }
}
