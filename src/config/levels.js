/**
 * 12-level config — 3 zones × 4 levels each.
 * Wave counts and boss placement match handover spec exactly.
 *
 * waves:
 *   { count, hp, speed, damage }        → enemy wave
 *   { boss: true, count?: N }           → N gorilla bosses
 *   { boss: true, sorBoss: 'zookeeper'|'animalcontrol'|'zamza'|'jack'|'jack+zamza' }
 */
export const LEVELS = [

  // ─── ZONE 1 — ZOO ────────────────────────────────────────────────────────
  {
    id: 1, zone: 'zoo', name: 'Monkey Mountain',
    bg: 'bg-zoo3',
    waves: [
      { count: 2,  hp: 55, speed: 95,  damage: 10 },
      { count: 4,  hp: 55, speed: 100, damage: 10 },
      { count: 6,  hp: 55, speed: 105, damage: 10 },
    ],
  },
  {
    id: 2, zone: 'zoo', name: 'The Reptile House',
    bg: 'bg-zoo2', walkTopRatio: 0.62,
    waves: [
      { count: 2,  hp: 55, speed: 105, damage: 10 },
      { count: 5,  hp: 55, speed: 110, damage: 10 },
      { count: 7,  hp: 55, speed: 115, damage: 10 },
      { boss: true, count: 1 },
    ],
  },
  {
    id: 3, zone: 'zoo', name: 'The Primate Enclosure',
    bg: 'bg-zoo4',
    waves: [
      { count: 3,  hp: 55, speed: 112, damage: 10 },
      { count: 6,  hp: 55, speed: 118, damage: 10 },
      { count: 9,  hp: 55, speed: 122, damage: 10 },
      { count: 12, hp: 55, speed: 125, damage: 10 },
    ],
  },
  {
    id: 4, zone: 'zoo', name: 'The Great Escape',
    bg: 'bg-zoo',
    waves: [
      { count: 4,  hp: 55, speed: 118, damage: 10 },
      { count: 8,  hp: 55, speed: 120, damage: 10 },
      { count: 9,  hp: 55, speed: 123, damage: 10 },
      { count: 12, hp: 55, speed: 125, damage: 10 },
      { boss: true, count: 1, sorBoss: 'zookeeper' },
    ],
  },

  // ─── ZONE 2 — ESCAPE ─────────────────────────────────────────────────────
  {
    id: 5, zone: 'escape', name: 'Beyond the Fence',
    bg: 'bg-escape', musicKey: 'music-city1',
    waves: [
      { count: 4,  hp: 55, speed: 122, damage: 10 },
      { count: 6,  hp: 55, speed: 126, damage: 10 },
      { count: 8,  hp: 55, speed: 130, damage: 10 },
    ],
  },
  {
    id: 6, zone: 'escape', name: 'Inner City',
    bg: 'bg-escape3', musicKey: 'music-city1',
    waves: [
      { count: 4,  hp: 55, speed: 128, damage: 10 },
      { count: 8,  hp: 55, speed: 132, damage: 10 },
      { count: 10, hp: 55, speed: 135, damage: 10 },
      { boss: true, count: 1, sorBoss: 'animalcontrol' },
    ],
  },
  {
    id: 7, zone: 'escape', name: 'Highway Underpass',
    bg: 'bg-street', musicKey: 'music-city2',
    waves: [
      { count: 5,  hp: 55, speed: 133, damage: 10 },
      { count: 8,  hp: 55, speed: 137, damage: 10 },
      { count: 12, hp: 55, speed: 140, damage: 10 },
      { count: 14, hp: 55, speed: 142, damage: 10 },
    ],
  },
  {
    id: 8, zone: 'escape', name: 'Night Market',
    bg: 'bg-escape2', musicKey: 'music-city2',
    enemyType: 'sor',
    waves: [
      { count: 6,  hp: 55, speed: 142, damage: 10 },
      { count: 10, hp: 55, speed: 146, damage: 10 },
      { boss: true, count: 1, sorBoss: 'animalcontrol' },
      { count: 12, hp: 55, speed: 149, damage: 10 },
      { count: 14, hp: 55, speed: 151, damage: 10 },
      { boss: true, sorBoss: 'jack+zamza' },
    ],
  },

  // ─── ZONE 3 — INTO THE WILD ───────────────────────────────────────────────
  {
    id: 9, zone: 'wild', name: 'The Forest',
    bg: 'bg-level9',
    waves: [
      { count: 6,  hp: 55, speed: 138, damage: 10 },
      { count: 10, hp: 55, speed: 142, damage: 10 },
      { count: 12, hp: 55, speed: 145, damage: 10 },
      { count: 14, hp: 55, speed: 148, damage: 10 },
    ],
  },
  {
    id: 10, zone: 'wild', name: 'The Deep Woods',
    bg: 'bg-level10',
    waves: [
      { count: 6,  hp: 55, speed: 146, damage: 10 },
      { count: 10, hp: 55, speed: 150, damage: 10 },
      { count: 14, hp: 55, speed: 153, damage: 10 },
      { count: 16, hp: 55, speed: 155, damage: 10 },
    ],
  },
  {
    id: 11, zone: 'wild', name: 'Into the Dark',
    bg: 'bg-level11',
    waves: [
      { count: 8,  hp: 55, speed: 150, damage: 10 },
      { count: 12, hp: 55, speed: 154, damage: 10 },
      { count: 16, hp: 55, speed: 157, damage: 10 },
      { count: 18, hp: 55, speed: 160, damage: 10 },
    ],
  },
  {
    id: 12, zone: 'wild', name: 'HOME',
    bg: 'bg-level12',
    waves: [
      { count: 8,  hp: 55, speed: 154, damage: 10 },
      { count: 12, hp: 55, speed: 158, damage: 10 },
      { count: 16, hp: 55, speed: 161, damage: 10 },
      { count: 18, hp: 55, speed: 164, damage: 10 },
      { boss: true, count: 2 },
      { count: 12, hp: 55, speed: 166, damage: 10 },
      { count: 16, hp: 55, speed: 168, damage: 10 },
      { count: 18, hp: 55, speed: 170, damage: 10 },
      { boss: true, count: 1 },  // gorilla placeholder — new sprite when we get to this level
    ],
  },
]
