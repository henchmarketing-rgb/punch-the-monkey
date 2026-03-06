/**
 * 12-level config — 3 zones × 4 levels each.
 * Difficulty compressed vs 16-level build — ramps harder, faster.
 * Enemy damage fixed at 10 throughout. Player HP 150 = exactly 15 hits to die.
 *
 * waves:
 *   { count, hp, speed, damage }        → enemy wave
 *   { boss: true, count?: N }           → N gorilla bosses
 *   { boss: true, easter: true }        → DK easter egg boss (L6)
 *   { boss: true, final: true }         → the lone final boss after L12 cinematic
 *
 * ⏳ = bg pending — falls back to bg-zoo-fallback in GameScene
 */
export const LEVELS = [

  // ─── ZONE 1 — ZOO ────────────────────────────────────────────────────────
  {
    id: 1, zone: 'zoo', name: 'Monkey Mountain',
    bg: 'bg-zoo', musicKey: 'music-zoo',
    waves: [
      { count: 3,  hp: 45, speed: 95,  damage: 10 },
      { count: 6,  hp: 45, speed: 100, damage: 10 },
      { count: 9,  hp: 45, speed: 105, damage: 10 },
    ],
  },
  {
    id: 2, zone: 'zoo', name: 'The Reptile House',
    bg: 'bg-zoo2', musicKey: 'music-zoo',
    waves: [
      { count: 4,  hp: 45, speed: 105, damage: 10 },
      { count: 8,  hp: 45, speed: 110, damage: 10 },
      { count: 12, hp: 45, speed: 115, damage: 10 },
    ],
  },
  {
    id: 3, zone: 'zoo', name: "The Keeper's Yard",
    bg: 'bg-zoo3', musicKey: 'music-zoo',   // ⏳ pending
    waves: [
      { count: 6,  hp: 45, speed: 112, damage: 10 },
      { count: 10, hp: 45, speed: 118, damage: 10 },
      { count: 14, hp: 45, speed: 122, damage: 10 },
    ],
  },
  {
    id: 4, zone: 'zoo', name: 'The Primate Enclosure',
    bg: 'bg-zoo4', musicKey: 'music-zoo',
    waves: [
      { count: 6,  hp: 45, speed: 118, damage: 10 },
      { count: 12, hp: 45, speed: 123, damage: 10 },
      { boss: true, count: 1 },
    ],
  },

  // ─── ZONE 2 — ESCAPE ─────────────────────────────────────────────────────
  {
    id: 5, zone: 'escape', name: 'Beyond the Fence',
    bg: 'bg-escape', musicKey: 'music-level2',
    waves: [
      { count: 6,  hp: 45, speed: 122, damage: 10 },
      { count: 10, hp: 45, speed: 126, damage: 10 },
      { count: 14, hp: 45, speed: 130, damage: 10 },
      { count: 18, hp: 45, speed: 132, damage: 10 },
    ],
  },
  {
    id: 6, zone: 'escape', name: 'Construction Site',
    bg: 'bg-escape2', musicKey: 'music-level2',  // ⏳ pending
    waves: [
      { count: 8,  hp: 45, speed: 128, damage: 10 },
      { count: 12, hp: 45, speed: 132, damage: 10 },
      { count: 16, hp: 45, speed: 135, damage: 10 },
      { boss: true, count: 1, easter: true },   // 🦍 DK easter egg
    ],
  },
  {
    id: 7, zone: 'escape', name: 'Highway Underpass',
    bg: 'bg-escape3', musicKey: 'music-level2',
    waves: [
      { count: 8,  hp: 45, speed: 133, damage: 10 },
      { count: 14, hp: 45, speed: 137, damage: 10 },
      { count: 18, hp: 45, speed: 140, damage: 10 },
      { count: 20, hp: 45, speed: 142, damage: 10 },
    ],
  },
  {
    id: 8, zone: 'escape', name: 'The Great Escape',
    bg: 'bg-escape4', musicKey: 'music-level2',  // ⏳ pending
    waves: [
      { count: 8,  hp: 45, speed: 138, damage: 10 },
      { count: 14, hp: 45, speed: 142, damage: 10 },
      { boss: true, count: 2 },
    ],
  },

  // ─── ZONE 3 — INTO THE WILD ───────────────────────────────────────────────
  {
    id: 9, zone: 'wild', name: 'Night Market',
    bg: 'bg-street', musicKey: 'music-forest1',
    waves: [
      { count: 10, hp: 45, speed: 142, damage: 10 },
      { count: 16, hp: 45, speed: 146, damage: 10 },
      { count: 20, hp: 45, speed: 149, damage: 10 },
      { count: 22, hp: 45, speed: 151, damage: 10 },
    ],
  },
  {
    id: 10, zone: 'wild', name: 'The Dockside',
    bg: 'bg-street2', musicKey: 'music-forest1',
    waves: [
      { count: 10, hp: 45, speed: 146, damage: 10 },
      { count: 16, hp: 45, speed: 150, damage: 10 },
      { count: 20, hp: 45, speed: 153, damage: 10 },
      { count: 24, hp: 45, speed: 155, damage: 10 },
    ],
  },
  {
    id: 11, zone: 'wild', name: 'Into the Dark',
    bg: 'bg-forest', musicKey: 'music-forest2',
    waves: [
      { count: 10, hp: 45, speed: 150, damage: 10 },
      { count: 16, hp: 45, speed: 154, damage: 10 },
      { boss: true, count: 1 },                    // mid-level surprise
      { count: 20, hp: 45, speed: 157, damage: 10 },
      { count: 24, hp: 45, speed: 160, damage: 10 },
    ],
  },
  {
    id: 12, zone: 'wild', name: 'HOME',
    bg: 'bg-forest4', musicKey: 'music-boss-final',
    waves: [
      { count: 10, hp: 45, speed: 154, damage: 10 },
      { count: 16, hp: 45, speed: 158, damage: 10 },
      { boss: true, count: 4 },                    // 4 gorillas
      { boss: true, count: 1, final: true },        // the last one after cinematic
    ],
  },
]
