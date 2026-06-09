import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FightingHeroResponseDto } from '../dto/responses/fighting-hero-response.dto';
import { SelectFightingHeroDto } from '../dto/requests/select-fighting-hero.dto';
import { FightingProfilesService } from '../services/fighting-profiles.service';
import { FightingProfileResponseDto } from '../dto/responses/fighting-profile-response.dto';
import { FightingResponseMapper } from '../mappers/fighting-response.mapper';

@ApiTags('fighting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fighting')
export class FightingProfilesController {
  constructor(
    private readonly fightingProfilesService: FightingProfilesService,
  ) {}

  @Get('profile/me')
  @ApiOperation({ summary: 'Get current user fighting profile' })
  @ApiOkResponse({
    type: FightingProfileResponseDto,
  })
  async getMyProfile(
    @CurrentUserId() userId: string,
  ): Promise<FightingProfileResponseDto> {
    const profile = await this.fightingProfilesService.getMyProfile(userId);

    return FightingResponseMapper.toProfileResponseDto(profile);
  }

  @Get('heroes')
  @ApiOperation({ summary: 'List available fighting heroes' })
  @ApiOkResponse({
    description: 'Config-driven fighting heroes',
    type: FightingHeroResponseDto,
    isArray: true,
  })
  getHeroes(): FightingHeroResponseDto[] {
    return this.fightingProfilesService
      .getHeroes()
      .map((hero) => FightingResponseMapper.toHeroResponseDto(hero));
  }

  @Patch('profile/me/hero')
  @ApiOperation({ summary: 'Select active fighting hero' })
  @ApiBody({
    type: SelectFightingHeroDto,
  })
  @ApiOkResponse({
    description: 'Updated fighting profile with selected hero',
    type: FightingProfileResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid fighting hero' })
  async selectHero(
    @CurrentUserId() userId: string,
    @Body() dto: SelectFightingHeroDto,
  ): Promise<FightingProfileResponseDto> {
    const profile = await this.fightingProfilesService.selectHero(
      userId,
      dto.heroId,
    );

    return FightingResponseMapper.toProfileResponseDto(profile);
  }
}
