import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Returns the current user' })
  findOne(@CurrentUserId() userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User successfully updated' })
  update(
    @CurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete current user' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  remove(@CurrentUserId() userId: string) {
    return this.usersService.remove(userId);
  }
}
