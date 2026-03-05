# 🐒 PUNCH-KUN — Beat-em-up

Streets of Rage-style browser game based on the viral Japanese macaque Punch-kun.

## Story
Baby Japanese macaque Punch-kun lives at Ichikawa City Zoo. Abandoned by his mother, 
bullied by 60 macaques on Monkey Mountain — but he's mentally strong and carries his 
orange Djungelskog toy everywhere. Now he's fighting his way OUT.

## Zones (15 Levels)
- **Zone 1 (1–4):** Zoo Interior — Monkey Mountain, enclosures, feeding zones
- **Zone 2 (5–8):** Zoo Escape — gates, gift shop, car park, head keeper boss
- **Zone 3 (9–11):** En Route — outskirts, highway, forest edge
- **Zone 4 (12–15):** The Forest — deep jungle, final boss, home

## Controls
| Key | Action |
|-----|--------|
| Arrow Keys | Move |
| Z | Punch |
| X | Kick |
| Space | Jump |

## Setup
```bash
npm install
npm run dev
```

## Art Assets Needed
### Player (Punch-kun)
- Sprite sheet: idle, walk (4f), punch (3f), kick (3f), jump (3f), hurt (2f), KO (2f)
- Size: 32×48px per frame, HD pixel art style
- Colors: white/grey fur, pink face, orange Djungelskog toy (mandatory)

### Enemies
- `macaque` — adult macaque grunt, brown fur, 32×48px
- `alpha-macaque` — larger, darker, 40×56px
- `zoo-keeper` — human in khaki uniform, 32×48px
- `gorilla-zoo` — boss gorilla, 64×72px

### Backgrounds (480×270px)
- Zoo enclosures, paths, gate, car park, outskirts, highway, forest (3 variants)

## Stack
- Phaser 3 + Vite
- HD pixel art (no antialiasing)
- Canvas: 480×270 @ 3× zoom
