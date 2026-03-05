/**
 * Level config — 4 zones.
 *
 * waves: array of entries:
 *   { count, hp, speed, damage }  → enemy wave
 *   { boss: true }                → gorilla boss interlude (mid-level or end)
 *
 * Enemies spawn equally from both sides each wave.
 */
export const LEVELS = [
  {
    id: 1, zone: 'zoo', name: 'Monkey Mountain',
    bg: 'bg-zoo', musicKey: 'music-level1',
    waves: [
      { count: 2,  hp: 45, speed: 100, damage: 8  },
      { count: 6,  hp: 45, speed: 110, damage: 9  },
      { count: 10, hp: 45, speed: 120, damage: 10 },
    ],
  },
  {
    id: 2, zone: 'escape', name: 'The Great Escape',
    bg: 'bg-escape', musicKey: 'music-level2',
    waves: [
      { count: 4,  hp: 45, speed: 120, damage: 9  },
      { count: 10, hp: 45, speed: 130, damage: 10 },
      { count: 14, hp: 45, speed: 140, damage: 10 },
      { boss: true },
    ],
  },
  {
    id: 3, zone: 'enroute', name: 'Neon Streets',
    bg: 'bg-street', musicKey: 'music-level1',
    waves: [
      { count: 4,  hp: 45, speed: 140, damage: 10 },
      { count: 10, hp: 45, speed: 150, damage: 10 },
      { count: 14, hp: 45, speed: 155, damage: 10 },
      { count: 18, hp: 45, speed: 160, damage: 10 },
    ],
  },
  {
    id: 4, zone: 'forest', name: 'HOME',
    bg: 'bg-forest', musicKey: 'music-level2',
    waves: [
      { count: 4,  hp: 45, speed: 155, damage: 10 },
      { count: 10, hp: 45, speed: 160, damage: 10 },
      { boss: true },
      { count: 14, hp: 45, speed: 165, damage: 10 },
      { count: 18, hp: 45, speed: 170, damage: 10 },
      { boss: true },
    ],
  },
]
