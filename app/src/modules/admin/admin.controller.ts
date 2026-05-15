import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  NotFoundException,
  Body,
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
} from '@nestjs/swagger';

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
  async findAll() {
    return this.adminService.findAll();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.adminService.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  // TODO: move userId to body
  @Patch('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user' })
  @ApiResponse({ status: 200, description: 'User banned' })
  @ApiParam({ name: 'id', description: 'User ID' })
  banUser(@Param('id') id: string, @Body() data: UpdateUserByAdminDto) {
    return this.adminService.ban(id, data);
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: 'Unban a user' })
  @ApiResponse({ status: 200, description: 'User unbanned' })
  @ApiParam({ name: 'id', description: 'User ID' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unban(id);
  }
}
