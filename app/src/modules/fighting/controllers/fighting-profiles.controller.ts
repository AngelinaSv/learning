import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/common/security/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { FIGHTING_HEROES } from '../constants/fighting-heroes.constants';
import { SelectFightingHeroDto } from '../dto/select-fighting-hero.dto';
import { FightingProfilesService } from '../services/fighting-profiles.service';

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
  @ApiResponse({
    status: 200,
    description: 'Current fighting profile with selected hero and rank',
    schema: {
      example: {
        id: '0c259a20-7796-4af5-9184-1692b670bc83',
        userId: '8b59c4c3-8c8a-45e0-a37a-7fdc7c7f3c9e',
        selectedHero: 'CYBER_NINJA',
        hero: FIGHTING_HEROES.CYBER_NINJA,
        rating: 800,
        rank: 'BRONZE',
        wins: 0,
        losses: 0,
        draws: 0,
        createdAt: '2026-06-08T10:00:00.000Z',
        updatedAt: '2026-06-08T10:00:00.000Z',
      },
    },
  })
  getMyProfile(@CurrentUserId() userId: string) {
    return this.fightingProfilesService.getMyProfile(userId);
  }

  @Get('heroes')
  @ApiOperation({ summary: 'List available fighting heroes' })
  @ApiResponse({
    status: 200,
    description: 'Config-driven fighting heroes',
    schema: {
      example: Object.values(FIGHTING_HEROES),
    },
  })
  getHeroes() {
    return this.fightingProfilesService.getHeroes();
  }

  @Patch('profile/me/hero')
  @ApiOperation({ summary: 'Select active fighting hero' })
  @ApiBody({
    type: SelectFightingHeroDto,
    examples: {
      neonSamurai: { value: { heroId: 'NEON_SAMURAI' } },
      holoMage: { value: { heroId: 'HOLO_MAGE' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated fighting profile with selected hero',
  })
  @ApiResponse({ status: 400, description: 'Invalid fighting hero' })
  selectHero(
    @CurrentUserId() userId: string,
    @Body() dto: SelectFightingHeroDto,
  ) {
    return this.fightingProfilesService.selectHero(userId, dto.heroId);
  }
}
