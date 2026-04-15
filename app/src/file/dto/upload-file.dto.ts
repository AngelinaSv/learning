import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'example.txt' })
  @IsString()
  filename: string;

  @ApiPropertyOptional({ description: 'Base64 encoded file content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Total chunks for chunked upload' })
  @IsOptional()
  @IsNumber()
  totalChunks?: number;

  @ApiPropertyOptional({ description: 'Current chunk index' })
  @IsOptional()
  @IsNumber()
  chunkIndex?: number;
}

export class AssembleChunksDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'example.txt' })
  @IsString()
  filename: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  totalChunks: number;
}
