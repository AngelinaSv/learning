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

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findOne(@CurrentUserId() userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch('me')
  update(
    @CurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('me')
  remove(@CurrentUserId() userId: string) {
    return this.usersService.remove(userId);
  }

  // @UseGuards(JwtAuthGuard)
  // @Patch('me/avatar')
  // updateAvatar(
  //   @CurrentUserId() userId: string,
  //   @Body('avatar') avatar: string | null,
  // ) {
  //   return this.usersService.updateAvatar(userId, avatar);
  // }
}
