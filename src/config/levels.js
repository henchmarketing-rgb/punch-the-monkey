/**
 * 16-level config — 4 zones × 4 levels each.
 *
 * waves entries:
 *   { count, hp, speed, damage }   → enemy wave
 *   { boss: true, count?: N }      → N gorilla bosses (default 1)
 *   { boss: true, final: true }    → the final single boss after L16 cinematic
 *
 * Enemy damage is fixed at 10 across all levels.
 * Difficulty scales via speed and wave count only.
 * Player HP 150 / damage 10 = exactly 15 hits to die, every level.
 *
 * ⏳ = bg not yet received — falls back to bg-zoo-fallback in GameScene
 */
export const LEVELS = [

  // ─── ZONE 1 — ZOO ────────────────────────────────────────────────────────
  {
    id: 1, zone: 'zoo', name: 'Monkey Mountain',
    bg: 'bg-zoo', musicKey: 'music-level1',
    waves: [
      { count: 2,  hp: 45, speed: 95,  damage: 10 },
      { count: 4,  hp: 45, speed: 100, damage: 10 },
      { count: 6,  hp: 45, speed: 105, damage: 10 },
    ],
  },
  {
    id: 2, zone: 'zoo', name: 'The Reptile House',
    bg: 'bg-zoo2', musicKey: 'music-level1',
    waves: [
      { count: 2,  hp: 45, speed: 100, damage: 10 },
      { count: 5,  hp: 45, speed: 105, damage: 10 },
      { count: 7,  hp: 45, speed: 110, damage: 10 },
    ],
  },
  {
    id: 3, zone: 'zoo', name: "The Keeper's Yard",
    bg: 'bg-zoo3', musicKey: 'music-level1',   // ⏳ pending
    waves: [
      { count: 3,  hp: 45, speed: 105, damage: 10 },
      { count: 6,  hp: 45, speed: 110, damage: 10 },
      { count: 9,  hp: 45, speed: 115, damage: 10 },
    ],
  },
  {
    id: 4, zone: 'zoo', name: 'The Primate Enclosure',
    bg: 'bg-zoo4', musicKey: 'music-level1',
    waves: [
      { count: 4,  hp: 45, speed: 110, damage: 10 },
      { count: 8,  hp: 45, speed: 115, damage: 10 },
      { boss: true, count: 1 },
    ],
  },

  // ─── ZONE 2 — ESCAPE ─────────────────────────────────────────────────────
  {
    id: 5, zone: 'escape', name: 'Beyond the Fence',
    bg: 'bg-escape', musicKey: 'music-level2',
    waves: [
      { count: 4,  hp: 45, speed: 115, damage: 10 },
      { count: 6,  hp: 45, speed: 120, damage: 10 },
      { count: 8,  hp: 45, speed: 122, damage: 10 },
    ],
  },
  {
    id: 6, zone: 'escape', name: 'Construction Site',
    bg: 'bg-escape2', musicKey: 'music-level2',  // ⏳ pending
    waves: [
      { count: 4,  hp: 45, speed: 120, damage: 10 },
      { count: 8,  hp: 45, speed: 125, damage: 10 },
      { count: 10, hp: 45, speed: 127, damage: 10 },
      { boss: true, count: 1, easter: true },   // 🦍 Donkey Kong easter egg
    ],
  },
  {
    id: 7, zone: 'escape', name: 'Highway Underpass',
    bg: 'bg-escape3', musicKey: 'music-level2',
    waves: [
      { count: 5,  hp: 45, speed: 125, damage: 10 },
      { count: 8,  hp: 45, speed: 128, damage: 10 },
      { count: 12, hp: 45, speed: 130, damage: 10 },
      { count: 14, hp: 45, speed: 132, damage: 10 },
    ],
  },
  {
    id: 8, zone: 'escape', name: 'The Great Escape',
    bg: 'bg-escape4', musicKey: 'music-level2',  // ⏳ pending
    waves: [
      { count: 6,  hp: 45, speed: 130, damage: 10 },
      { count: 10, hp: 45, speed: 133, damage: 10 },
      { boss: true, count: 2 },
    ],
  },

  // ─── ZONE 3 — STREETS ────────────────────────────────────────────────────
  {
    id: 9, zone: 'streets', name: 'Night Market',
    bg: 'bg-street', musicKey: 'music-level1',
    waves: [
      { count: 6,  hp: 45, speed: 133, damage: 10 },
      { count: 10, hp: 45, speed: 136, damage: 10 },
      { count: 12, hp: 45, speed: 138, damage: 10 },
      { count: 14, hp: 45, speed: 140, damage: 10 },
    ],
  },
  {
    id: 10, zone: 'streets', name: 'The Dockside',
    bg: 'bg-street2', musicKey: 'music-level1',
    waves: [
      { count: 6,  hp: 45, speed: 138, damage: 10 },
      { count: 10, hp: 45, speed: 140, damage: 10 },
      { count: 14, hp: 45, speed: 142, damage: 10 },
      { count: 16, hp: 45, speed: 144, damage: 10 },
    ],
  },
  {
    id: 11, zone: 'streets', name: 'The Overpass',
    bg: 'bg-street3', musicKey: 'music-level1',  // ⏳ pending
    waves: [
      { count: 8,  hp: 45, speed: 141, damage: 10 },
      { count: 12, hp: 45, speed: 143, damage: 10 },
      { count: 16, hp: 45, speed: 145, damage: 10 },
      { count: 18, hp: 45, speed: 147, damage: 10 },
    ],
  },
  {
    id: 12, zone: 'streets', name: 'Neon Streets',
    bg: 'bg-street4', musicKey: 'music-level1',  // ⏳ pending
    waves: [
      { count: 8,  hp: 45, speed: 144, damage: 10 },
      { count: 12, hp: 45, speed: 147, damage: 10 },
      { count: 16, hp: 45, speed: 149, damage: 10 },
      { boss: true, count: 2 },
    ],
  },

  // ─── ZONE 4 — FOREST ─────────────────────────────────────────────────────
  {
    id: 13, zone: 'forest', name: 'Into the Dark',
    bg: 'bg-forest', musicKey: 'music-level2',
    waves: [
      { count: 8,  hp: 45, speed: 147, damage: 10 },
      { count: 12, hp: 45, speed: 150, damage: 10 },
      { count: 16, hp: 45, speed: 152, damage: 10 },
      { count: 20, hp: 45, speed: 154, damage: 10 },
    ],
  },
  {
    id: 14, zone: 'forest', name: 'The Moonlit Glade',
    bg: 'bg-forest2', musicKey: 'music-level2',
    waves: [
      { count: 8,  hp: 45, speed: 150, damage: 10 },
      { count: 14, hp: 45, speed: 152, damage: 10 },
      { count: 18, hp: 45, speed: 154, damage: 10 },
      { count: 22, hp: 45, speed: 156, damage: 10 },
    ],
  },
  {
    id: 15, zone: 'forest', name: 'The Deep Forest',
    bg: 'bg-forest3', musicKey: 'music-level2',  // ⏳ pending
    waves: [
      { count: 8,  hp: 45, speed: 152, damage: 10 },
      { count: 14, hp: 45, speed: 154, damage: 10 },
      { boss: true, count: 1 },
      { count: 18, hp: 45, speed: 156, damage: 10 },
      { count: 22, hp: 45, speed: 158, damage: 10 },
    ],
  },
  {
    id: 16, zone: 'forest', name: 'HOME',
    bg: 'bg-forest4', musicKey: 'music-level2',
    waves: [
      { count: 10, hp: 45, speed: 154, damage: 10 },
      { count: 14, hp: 45, speed: 156, damage: 10 },
      { boss: true, count: 4 },
      { boss: true, count: 1, final: true },   // the last one — spawns after cinematic
    ],
  },
]
