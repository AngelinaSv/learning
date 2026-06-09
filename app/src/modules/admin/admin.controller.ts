import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserRole } from '../users/enums/user-role.enum';
import { Roles } from 'src/common/security/decorators/roles.decorator';
import { RolesGuard } from 'src/common/security/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() data: PaginationQueryDto) {
    return this.adminService.getUsersList(data);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Ban a user' })
  @ApiResponse({ status: 200, description: 'User banned' })
  @ApiParam({ name: 'id', description: 'User ID' })
  banUser(@Param('id') id: string, @Body() data: UpdateUserByAdminDto) {
    return this.adminService.update(id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiParam({ name: 'id', description: 'User ID' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.removeUser(id);
  }
}
