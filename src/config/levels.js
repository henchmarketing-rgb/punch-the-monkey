/**
 * Level config — 4 zones, each with multiple waves.
 *
 * Enemy HP tuning:
 *   - Macaque: hp=42  → dies in exactly 3 punches (player attackDmg=15, punch=15, kick=22)
 *   - Player:  hp=150 → survives 15 hits at 10 damage each
 *
 * bossAt: 'gorilla' → gorilla boss spawns after all waves (hp handled in Boss.js)
 */
export const LEVELS = [
  {
    id: 1, zone: 'zoo', name: 'Monkey Mountain',
    bg: 'bg-zoo', musicKey: 'music-level1',
    bossAt: null,
    waves: [
      { count: 3, hp: 45, speed: 100, damage: 8  },
      { count: 4, hp: 45, speed: 110, damage: 9  },
      { count: 4, hp: 45, speed: 120, damage: 10 },
    ],
  },
  {
    id: 2, zone: 'escape', name: 'The Great Escape',
    bg: 'bg-escape', musicKey: 'music-level2',
    bossAt: 'gorilla',
    waves: [
      { count: 4, hp: 45, speed: 120, damage: 9  },
      { count: 5, hp: 45, speed: 130, damage: 10 },
      { count: 5, hp: 45, speed: 140, damage: 10 },
    ],
  },
  {
    id: 3, zone: 'enroute', name: 'Neon Streets',
    bg: 'bg-street', musicKey: 'music-level1',
    bossAt: null,
    waves: [
      { count: 5, hp: 45, speed: 140, damage: 10 },
      { count: 6, hp: 45, speed: 150, damage: 10 },
      { count: 6, hp: 45, speed: 155, damage: 10 },
      { count: 7, hp: 45, speed: 160, damage: 10 },
    ],
  },
  {
    id: 4, zone: 'forest', name: 'HOME',
    bg: 'bg-forest', musicKey: 'music-level2',
    bossAt: null,
    waves: [
      { count: 6, hp: 45, speed: 155, damage: 10 },
      { count: 7, hp: 45, speed: 165, damage: 10 },
      { count: 8, hp: 45, speed: 170, damage: 10 },
    ],
  },
]
