import {
  Controller,
  HttpCode,
  Post,
  Get,
  Body,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { AuthTokenDto, SignInDto, SignUpDto } from './dto';
import { AuthService } from './auth.service';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ type: AuthTokenDto, status: HttpStatus.CREATED })
  async signUp(@Body() signUpDto: SignUpDto): Promise<AuthTokenDto> {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: AuthTokenDto, status: HttpStatus.OK })
  async signIn(@Body() signInDto: SignInDto): Promise<AuthTokenDto> {
    return this.authService.signIn(signInDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Req() req: Request & { user: UserEntity }) {
    return req.user;
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ type: AuthTokenDto, status: HttpStatus.OK })
  async signOut(
    @GetCurrentUserId() userId: string,
  ): Promise<{ success: boolean }> {
    return this.authService.signOut(userId);
  }
}
