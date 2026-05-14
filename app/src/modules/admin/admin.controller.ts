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
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async findAll() {
    return this.adminService.findAll();
  }

  @Get('users/:id')
  async findOne(@Param('id') id: string) {
    const user = await this.adminService.findOne(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  // TODO: move userId to body
  @Patch('users/:id/ban')
  banUser(@Param('id') id: string, @Body() data: UpdateUserByAdminDto) {
    return this.adminService.ban(id, data);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unban(id);
  }
}
