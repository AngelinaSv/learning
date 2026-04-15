import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './types/user.type';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login - returns user if credentials valid' })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.userService.findByEmail(body.email);
    if (!user || user.password !== body.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update user' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request & { user: User },
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Delete a user' })
  async remove(@Param('id') id: string, @Req() req: Request & { user: User }) {
    await this.userService.remove(id);
    return { message: 'User deleted' };
  }
}
