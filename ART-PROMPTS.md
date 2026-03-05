# Art Prompts — Punch-kun Game

All art: **Classic 16-bit pixel art in the style of Streets of Rage 2 (Sega Mega Drive/Genesis)**.
Rich colour, detailed shading, strong outlines, no antialiasing, transparent background unless noted.
Reference: SOR2 sprite style — ~48-64px tall characters, detailed limb shading, vibrant limited palette.
Generate at 3× and downsample for crispness.

---

## 1. PUNCH-KUN — Hero Character

### Concept Sheet (generate first to lock the design)
```
HD pixel art character concept sheet, baby Japanese macaque (snow monkey), 
7 months old, very small and young, white and light grey fluffy fur, 
bright pink expressive face, large round dark eyes, tiny ears. 
He clutches a large orange fluffy stuffed orangutan plush toy against his chest 
(the toy is oversized relative to his small body — he hugs it tightly). 
The toy has round ears, orange fur, a lighter orange face. 
Pose: front-facing idle stance, slightly hunched, feet apart, 
toy held in both arms against chest. 
Cute and endearing but with a determined expression. 
Japanese zoo enclosure background (very light, out of focus). 
Style: modern HD pixel art, clear pixel outlines, vibrant colours, 
reminiscent of Shovel Knight or Streets of Rage 4. 
Transparent background version also needed.
No antialiasing. Clean pixels.
```

### Walk Cycle (4 frames)
```
HD pixel art sprite sheet, baby Japanese macaque, white/grey fluffy fur, 
pink face, holding orange stuffed orangutan toy in left arm while running/walking. 
4-frame walk cycle on single row, each frame 32px wide 48px tall, 
left-facing. Arms and legs animate, toy bounces slightly. 
Transparent background. Pixel art, no antialiasing.
```

### Punch Attack (3 frames)
```
HD pixel art sprite sheet, baby Japanese macaque, white/grey fluffy fur, pink face. 
Punch animation: wind-up → extend → recoil. 
Right arm punches forward, orange stuffed toy held in left arm, 
slight lean forward. 3 frames horizontal, 32×48px each. 
Transparent background. Pixel art style.
```

### Kick Attack (3 frames)
```
HD pixel art sprite sheet, baby Japanese macaque, 3-frame kick animation. 
Side kick: foot raised → extend → return. White/grey fur, pink face, 
orange plush toy held to chest. 32×48px per frame. 
Transparent background. HD pixel art.
```

### Hurt / KO (2+2 frames)
```
HD pixel art sprite sheet, baby Japanese macaque, hurt animation (2 frames: 
flinch back, recover) + KO animation (2 frames: collapse, lying down). 
White/grey fur, pink face, orange toy. 32×48px per frame, 4 frames total on one row. 
Transparent background. Pixel art.
```

---

## 2. MACAQUE GRUNT — Enemy

### Concept (lock design)
```
HD pixel art character concept, adult Japanese macaque (snow monkey), 
aggressive expression, darker grey-brown fur, red face, muscular build, 
walking upright like a bully. Bigger and more imposing than Punch-kun. 
Front-facing. Japanese zoo background (out of focus). 
Modern HD pixel art style. Transparent background option.
```

### Walk + Attack Sheet
```
HD pixel art enemy sprite sheet, adult Japanese macaque grunt. 
Row 1: 4-frame walk cycle (left-facing), 32×48px per frame.
Row 2: 3-frame attack (lunge forward, swipe, recoil), 32×48px per frame.
Dark grey-brown fur, red face, aggressive stance. Transparent background.
```

---

## 3. GORILLA BOSS — Zone 1 Boss

### Concept
```
HD pixel art boss character, massive silverback gorilla, imposing and angry. 
Black fur, silver back stripe, heavy brow, knuckle-walking then rising to full height. 
Zoo arena background (out of focus). Style: Streets of Rage boss energy — 
big, threatening, fills the frame. 64×72px scale.
Modern HD pixel art. Transparent background option.
```

---

## 4. BACKGROUNDS

### Zoo — Monkey Mountain (Level 1)
```
HD pixel art game background, 480×270px, Japanese zoo monkey enclosure. 
Monkey Mountain: tiered rocky terrain, wooden climbing structures, ropes, 
concrete floor with dirt patches. Metal mesh fencing in the back. 
Cherry blossom tree visible over the fence. Blue sky. 
Warm afternoon light. Style: Streets of Rage side-scrolling beat-em-up 
background, multiple depth layers for parallax. Vibrant colours.
```

### Zoo — Gate / Escape (Level 5)
```
HD pixel art game background, 480×270px, zoo entrance gate and gift shop area. 
Iron gates open/bent, visitors running, gift shop on right side, 
Japanese signage, flowers in planters. Sunset orange sky (the escape begins). 
Streets of Rage style scrolling background. Vibrant, detailed.
```

### Forest (Level 12+)
```
HD pixel art game background, 480×270px, dense Japanese forest. 
Tall cedar/pine trees, dappled light, mossy ground, ferns. 
Mystical, lush, green. Distant mountains visible between trees. 
Golden hour light. Streets of Rage beat-em-up background style, 
layered for parallax scrolling.
```

---

## Notes
- Always generate at 3× target size, then downsample for crisp pixels
- Orange Djungelskog toy on Punch-kun is NON-NEGOTIABLE — must appear in every frame
- Enemy macaques should look visibly adult and menacing vs Punch-kun's small/cute
- Gorilla boss should feel like a genuine threat — enormous scale difference
