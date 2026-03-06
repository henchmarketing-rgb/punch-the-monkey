/**
 * 16-level config — 4 zones × 4 levels each.
 *
 * waves entries:
 *   { count, hp, speed, damage }  → enemy wave
 *   { boss: true }                → gorilla boss interlude
 *
 * bg keys map to public/assets/backgrounds/
 * ⏳ = placeholder — bg not yet received, falls back to bg-zoo-fallback
 */
export const LEVELS = [

  // ─── ZONE 1 — ZOO ────────────────────────────────────────────────────────
  {
    id: 1, zone: 'zoo', name: 'Monkey Mountain',
    bg: 'bg-zoo', musicKey: 'music-level1',
    waves: [
      { count: 2,  hp: 45, speed: 95,  damage: 7  },
      { count: 4,  hp: 45, speed: 100, damage: 8  },
      { count: 6,  hp: 45, speed: 105, damage: 8  },
    ],
  },
  {
    id: 2, zone: 'zoo', name: 'The Reptile House',
    bg: 'bg-zoo2', musicKey: 'music-level1',
    waves: [
      { count: 3,  hp: 45, speed: 105, damage: 8  },
      { count: 6,  hp: 45, speed: 110, damage: 9  },
      { count: 9,  hp: 45, speed: 115, damage: 9  },
    ],
  },
  {
    id: 3, zone: 'zoo', name: "The Keeper's Yard",
    bg: 'bg-zoo3', musicKey: 'music-level1',   // ⏳ bg-zoo3 pending
    waves: [
      { count: 4,  hp: 45, speed: 110, damage: 9  },
      { count: 8,  hp: 45, speed: 115, damage: 9  },
      { count: 12, hp: 45, speed: 120, damage: 10 },
    ],
  },
  {
    id: 4, zone: 'zoo', name: 'The Primate Enclosure',
    bg: 'bg-zoo4', musicKey: 'music-level2',
    waves: [
      { count: 4,  hp: 45, speed: 115, damage: 10 },
      { count: 8,  hp: 45, speed: 120, damage: 10 },
      { boss: true },
    ],
  },

  // ─── ZONE 2 — ESCAPE ─────────────────────────────────────────────────────
  {
    id: 5, zone: 'escape', name: 'Beyond the Fence',
    bg: 'bg-escape', musicKey: 'music-level1',
    waves: [
      { count: 4,  hp: 45, speed: 120, damage: 9  },
      { count: 8,  hp: 45, speed: 125, damage: 10 },
      { count: 12, hp: 45, speed: 130, damage: 10 },
    ],
  },
  {
    id: 6, zone: 'escape', name: 'Construction Site',
    bg: 'bg-escape2', musicKey: 'music-level1',  // ⏳ bg-escape2 pending
    waves: [
      { count: 5,  hp: 45, speed: 125, damage: 10 },
      { count: 10, hp: 45, speed: 130, damage: 10 },
      { count: 14, hp: 45, speed: 135, damage: 11 },
    ],
  },
  {
    id: 7, zone: 'escape', name: 'Highway Underpass',
    bg: 'bg-escape3', musicKey: 'music-level1',
    waves: [
      { count: 6,  hp: 45, speed: 130, damage: 10 },
      { count: 10, hp: 45, speed: 135, damage: 11 },
      { count: 14, hp: 45, speed: 140, damage: 11 },
      { count: 18, hp: 45, speed: 140, damage: 11 },
    ],
  },
  {
    id: 8, zone: 'escape', name: 'The Great Escape',
    bg: 'bg-escape4', musicKey: 'music-level2',  // ⏳ bg-escape4 pending
    waves: [
      { count: 6,  hp: 45, speed: 135, damage: 11 },
      { count: 10, hp: 45, speed: 140, damage: 11 },
      { boss: true },
    ],
  },

  // ─── ZONE 3 — STREETS ────────────────────────────────────────────────────
  {
    id: 9, zone: 'streets', name: 'Night Market',
    bg: 'bg-street', musicKey: 'music-level1',
    waves: [
      { count: 6,  hp: 45, speed: 140, damage: 11 },
      { count: 10, hp: 45, speed: 145, damage: 11 },
      { count: 14, hp: 45, speed: 148, damage: 12 },
      { count: 18, hp: 45, speed: 150, damage: 12 },
    ],
  },
  {
    id: 10, zone: 'streets', name: 'The Dockside',
    bg: 'bg-street2', musicKey: 'music-level1',
    waves: [
      { count: 6,  hp: 45, speed: 145, damage: 12 },
      { count: 12, hp: 45, speed: 150, damage: 12 },
      { count: 16, hp: 45, speed: 153, damage: 12 },
      { count: 20, hp: 45, speed: 155, damage: 12 },
    ],
  },
  {
    id: 11, zone: 'streets', name: 'The Overpass',
    bg: 'bg-street3', musicKey: 'music-level1',  // ⏳ bg-street3 pending
    waves: [
      { count: 8,  hp: 45, speed: 150, damage: 12 },
      { count: 14, hp: 45, speed: 155, damage: 13 },
      { count: 18, hp: 45, speed: 158, damage: 13 },
      { count: 22, hp: 45, speed: 160, damage: 13 },
    ],
  },
  {
    id: 12, zone: 'streets', name: 'Neon Streets',
    bg: 'bg-street4', musicKey: 'music-level2',  // ⏳ bg-street4 pending
    waves: [
      { count: 8,  hp: 45, speed: 155, damage: 13 },
      { count: 14, hp: 45, speed: 160, damage: 13 },
      { boss: true },
    ],
  },

  // ─── ZONE 4 — FOREST ─────────────────────────────────────────────────────
  {
    id: 13, zone: 'forest', name: 'Into the Dark',
    bg: 'bg-forest', musicKey: 'music-level1',
    waves: [
      { count: 8,  hp: 45, speed: 158, damage: 13 },
      { count: 14, hp: 45, speed: 162, damage: 14 },
      { count: 18, hp: 45, speed: 165, damage: 14 },
      { count: 22, hp: 45, speed: 167, damage: 14 },
    ],
  },
  {
    id: 14, zone: 'forest', name: 'The Moonlit Glade',
    bg: 'bg-forest2', musicKey: 'music-level1',
    waves: [
      { count: 8,  hp: 45, speed: 162, damage: 14 },
      { count: 14, hp: 45, speed: 165, damage: 14 },
      { count: 18, hp: 45, speed: 168, damage: 14 },
      { count: 22, hp: 45, speed: 170, damage: 15 },
      { count: 26, hp: 45, speed: 172, damage: 15 },
    ],
  },
  {
    id: 15, zone: 'forest', name: 'The Deep Forest',
    bg: 'bg-forest3', musicKey: 'music-level2',  // ⏳ bg-forest3 pending
    waves: [
      { count: 8,  hp: 45, speed: 165, damage: 14 },
      { count: 14, hp: 45, speed: 168, damage: 15 },
      { boss: true },
      { count: 18, hp: 45, speed: 170, damage: 15 },
      { count: 22, hp: 45, speed: 172, damage: 15 },
    ],
  },
  {
    id: 16, zone: 'forest', name: 'HOME',
    bg: 'bg-forest4', musicKey: 'music-level2',
    waves: [
      { count: 8,  hp: 45, speed: 168, damage: 15 },
      { count: 14, hp: 45, speed: 170, damage: 15 },
      { boss: true },
      { count: 18, hp: 45, speed: 172, damage: 16 },
      { count: 22, hp: 45, speed: 174, damage: 16 },
      { boss: true },
    ],
  },
]
