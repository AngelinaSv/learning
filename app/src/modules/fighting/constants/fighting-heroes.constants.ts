export const FIGHTING_HEROES = {
  CYBER_NINJA: {
    id: 'CYBER_NINJA',
    name: 'Cyber Ninja',
    description:
      'A swift cyber fighter with higher attack power but lower health.',
    maxHealth: 9,
    strike: 4,
    blockPower: 2,
  },

  NEON_SAMURAI: {
    id: 'NEON_SAMURAI',
    name: 'Neon Samurai',
    description:
      'A heavily armored warrior with increased health but weaker defense.',
    maxHealth: 12,
    strike: 3,
    blockPower: 1,
  },

  HOLO_MAGE: {
    id: 'HOLO_MAGE',
    name: 'Holo Mage',
    description: 'A holographic mage focused on defense and energy shielding.',
    maxHealth: 10,
    strike: 3,
    blockPower: 3,
  },
} as const;

export type FightingHeroId = keyof typeof FIGHTING_HEROES;

export const FIGHTING_HERO_IDS = Object.keys(
  FIGHTING_HEROES,
) as FightingHeroId[];

export const FIGHTING_DEFAULT_HERO_ID: FightingHeroId = 'CYBER_NINJA';
