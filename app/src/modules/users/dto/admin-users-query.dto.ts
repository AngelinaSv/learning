import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class AdminUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'john',
    description: 'Search users by username or email',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
