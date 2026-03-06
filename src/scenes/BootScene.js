export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot') }

  preload() {
    // === PUNCH-KUN ===
    this.load.image('punch-idle',     'assets/sprites/punch-idle.png')
    this.load.spritesheet('punch-walk',    'assets/sprites/punch-walk.png',    { frameWidth: 174, frameHeight: 240 })
    this.load.spritesheet('punch-attack',  'assets/sprites/punch-attack.png',  { frameWidth: 225, frameHeight: 240 })
    this.load.spritesheet('punch-kick',    'assets/sprites/punch-kick.png',    { frameWidth: 219, frameHeight: 240 })
    this.load.spritesheet('punch-hurt',    'assets/sprites/punch-hurt.png',    { frameWidth: 201, frameHeight: 240 })
    this.load.spritesheet('punch-special', 'assets/sprites/punch-special.png', { frameWidth: 312, frameHeight: 256 })

    // === GORILLA BOSS ===
    this.load.image('gorilla-idle',        'assets/sprites/gorilla-boss.png')
    this.load.spritesheet('gorilla-walk',  'assets/sprites/gorilla-walk.png',   { frameWidth: 316, frameHeight: 272 })
    this.load.spritesheet('gorilla-slam',  'assets/sprites/gorilla-slam.png',   { frameWidth: 393, frameHeight: 390 })
    this.load.spritesheet('gorilla-attack','assets/sprites/gorilla-attack.png', { frameWidth: 390, frameHeight: 360 })
    this.load.spritesheet('gorilla-chest', 'assets/sprites/gorilla-chest.png',  { frameWidth: 324, frameHeight: 312 })

    // === MACAQUE GRUNT ===
    this.load.spritesheet('macaque-walk',   'assets/sprites/macaque-walk.png',   { frameWidth: 270, frameHeight: 300 })
    this.load.spritesheet('macaque-attack', 'assets/sprites/macaque-attack.png', { frameWidth: 390, frameHeight: 300 })
    this.load.spritesheet('macaque-hurt',   'assets/sprites/macaque-hurt.png',   { frameWidth: 270, frameHeight: 270 })

    // === BOSS SPRITES ===
    this.load.spritesheet('zookeeper',     'assets/sprites/zookeeper.png',     { frameWidth: 192, frameHeight: 355 })
    this.load.spritesheet('animal-control','assets/sprites/animal-control.png',{ frameWidth: 384, frameHeight: 407 })

    // === SOR ENEMY + BOSSES (L9 — Streets of Rage homage) ===
    this.load.spritesheet('sor-enemy',       'assets/sprites/sor-enemy.png',       { frameWidth: 76,  frameHeight: 88  })
    this.load.spritesheet('sor-boss-zamza',  'assets/sprites/sor-boss-zamza.png',  { frameWidth: 76,  frameHeight: 82  })
    this.load.spritesheet('sor-boss-jack', 'assets/sprites/sor-boss-jack.png', { frameWidth: 104, frameHeight: 104 })

    // === EFFECTS ===
    this.load.spritesheet('hit-effects',    'assets/sprites/hit-effects.png',    { frameWidth: 144, frameHeight: 144 })
    this.load.spritesheet('boss-shockwave', 'assets/sprites/boss-shockwave.png', { frameWidth: 414, frameHeight: 240 })
    this.load.spritesheet('boss-fx-ring',   'assets/sprites/boss-fx-ring.png',   { frameWidth: 288, frameHeight: 288 })
    this.load.spritesheet('boss-fx-fire',   'assets/sprites/boss-fx-fire.png',   { frameWidth: 288, frameHeight: 288 })

    // === AUDIO ===
    // Music
    // Boot loads: Zone 1 music + SFX only (~15MB).
    // Zone 2 music (city) loaded in LoreScene act 1 (after L4, during story text).
    // Zone 3 music (forest) loaded in LoreScene act 2 (after L8, during story text).
    this.load.audio('music-title', 'assets/audio/music-title.mp3')
    this.load.audio('music-zoo',   'assets/audio/music-zoo.mp3')
    this.load.audio('music-boss',  'assets/audio/music-boss.mp3')
    // SFX
    this.load.audio('sfx-punch',          'assets/audio/sfx-punch.wav')
    this.load.audio('sfx-kick',           'assets/audio/sfx-kick.mp3')
    this.load.audio('sfx-special',        'assets/audio/sfx-special.wav')
    this.load.audio('sfx-health-low',     'assets/audio/sfx-health-low.wav')
    this.load.audio('sfx-press-start',    'assets/audio/sfx-press-start.wav')
    this.load.audio('sfx-player-death',   'assets/audio/sfx-player-death.wav')
    this.load.audio('sfx-level-complete', 'assets/audio/sfx-level-complete.mp3')
    this.load.audio('sfx-enemy-attack',   'assets/audio/sfx-enemy-attack.wav')
    this.load.audio('sfx-enemy-death',    'assets/audio/sfx-enemy-death.wav')
    this.load.audio('sfx-boss-attack',    'assets/audio/sfx-boss-attack.mp3')
    this.load.audio('sfx-boss-special',   'assets/audio/sfx-boss-special.mp3')
    this.load.audio('sfx-boss-intro',     'assets/audio/sfx-boss-intro.wav')
    this.load.audio('sfx-boss-death',     'assets/audio/sfx-boss-death.wav')

    // === BACKGROUNDS ===
    // Zone 1 — Zoo
    this.load.image('bg-zoo',    'assets/backgrounds/bg-zoo.webp')
    this.load.image('bg-zoo2',   'assets/backgrounds/bg-zoo2.webp')
    this.load.image('bg-zoo3',   'assets/backgrounds/bg-zoo3.webp')
    this.load.image('bg-zoo4',   'assets/backgrounds/bg-zoo4.webp')
    this.load.image('bg-dusk',   'assets/backgrounds/bg-dusk.webp')

    // Zone 2 — Escape
    this.load.image('bg-escape',  'assets/backgrounds/bg-escape.webp')
    this.load.image('bg-escape2', 'assets/backgrounds/bg-escape2.webp')
    this.load.image('bg-escape3', 'assets/backgrounds/bg-escape3.webp')
    this.load.image('bg-escape4', 'assets/backgrounds/bg-escape4.webp')

    // Zone 3 — Streets
    this.load.image('bg-street',  'assets/backgrounds/bg-street.webp')
    this.load.image('bg-street2', 'assets/backgrounds/bg-street2.webp')
    // bg-street3 pending
    // bg-street4 pending

    // Zone 4 — Forest
    this.load.image('bg-forest',  'assets/backgrounds/bg-forest.webp')
    this.load.image('bg-forest2', 'assets/backgrounds/bg-forest2.webp')
    // bg-forest3 pending
    this.load.image('bg-forest4', 'assets/backgrounds/bg-forest4.webp')
    this.load.image('title-bg',  'assets/ui/title-bg.png')
    this.load.image('banana',    'assets/items/banana.png')

    // Fallback
    this.createFallbackBG()

    this.load.on('loaderror', (file) => console.warn('Asset load error:', file.key))

    // ── Progress bar ──
    const { width, height } = this.scale
    const barW = 320, barH = 12
    const bx = width / 2 - barW / 2, by = height * 0.72

    const bg = this.add.rectangle(width / 2, by + barH / 2, barW + 4, barH + 4, 0x222222).setDepth(10)
    const fill = this.add.rectangle(bx, by + barH / 2, 0, barH, 0xffd700).setOrigin(0, 0.5).setDepth(11)
    const label = this.add.text(width / 2, by + 28, 'LOADING...', {
      fontSize: '13px', fontFamily: 'monospace', color: '#888888'
    }).setOrigin(0.5).setDepth(11)

    this.load.on('progress', (v) => {
      fill.width = barW * v
      label.setText(`LOADING  ${Math.floor(v * 100)}%`)
    })
    this.load.on('complete', () => {
      bg.destroy(); fill.destroy(); label.destroy()
    })
  }

  createFallbackBG() {
    const g = this.make.graphics({ add: false })
    const W = 1440, H = 810
    g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb0d8f0, 0xb0d8f0)
    g.fillRect(0, 0, W, 330)
    g.fillStyle(0x8a9278); g.fillRect(0, 270, W, 150)
    g.fillStyle(0x9a7a5a); g.fillRect(0, 315, W, 90)
    g.fillStyle(0x7a7a6a); g.fillRect(0, 456, W, H - 456)
    g.generateTexture('bg-zoo-fallback', W, H)
    g.destroy()
  }

  create() {
    this.createAnimations()
    this.scene.start('Title')
  }

  createAnimations() {
    const anims = this.anims

    anims.create({ key: 'punch-walk',    frames: anims.generateFrameNumbers('punch-walk',    { start: 0, end: 3 }), frameRate: 8,  repeat: -1 })
    anims.create({ key: 'punch-attack',  frames: anims.generateFrameNumbers('punch-attack',  { start: 0, end: 2 }), frameRate: 12, repeat: 0  })
    anims.create({ key: 'punch-kick',    frames: anims.generateFrameNumbers('punch-kick',    { start: 0, end: 2 }), frameRate: 12, repeat: 0  })
    anims.create({ key: 'punch-hurt',    frames: anims.generateFrameNumbers('punch-hurt',    { start: 0, end: 1 }), frameRate: 8,  repeat: 0  })
    anims.create({ key: 'punch-special', frames: anims.generateFrameNumbers('punch-special', { start: 0, end: 2 }), frameRate: 8,  repeat: 0  })

    anims.create({ key: 'gorilla-walk',   frames: anims.generateFrameNumbers('gorilla-walk',   { start: 0, end: 2 }), frameRate: 6, repeat: -1 })
    anims.create({ key: 'gorilla-slam',   frames: anims.generateFrameNumbers('gorilla-slam',   { start: 0, end: 2 }), frameRate: 8, repeat: 0  })
    anims.create({ key: 'gorilla-attack', frames: anims.generateFrameNumbers('gorilla-attack', { start: 0, end: 1 }), frameRate: 8, repeat: 0  })
    anims.create({ key: 'gorilla-chest',  frames: anims.generateFrameNumbers('gorilla-chest',  { start: 0, end: 2 }), frameRate: 8, repeat: -1 })

    anims.create({ key: 'macaque-walk',   frames: anims.generateFrameNumbers('macaque-walk',   { start: 0, end: 3 }), frameRate: 7, repeat: -1 })
    anims.create({ key: 'macaque-attack', frames: anims.generateFrameNumbers('macaque-attack', { start: 0, end: 1 }), frameRate: 8, repeat: 0  })
    anims.create({ key: 'macaque-hurt',   frames: anims.generateFrameNumbers('macaque-hurt',   { start: 0, end: 1 }), frameRate: 8, repeat: 0  })

    // Animal Control boss — 9 frames (384×407): 0-4 walk, 5-7 attack (net swing), 8 hurt
    anims.create({ key: 'animalcontrol-walk',   frames: anims.generateFrameNumbers('animal-control', { start: 0, end: 4 }), frameRate: 7,  repeat: -1 })
    anims.create({ key: 'animalcontrol-attack', frames: anims.generateFrameNumbers('animal-control', { start: 5, end: 7 }), frameRate: 9,  repeat: 0  })
    anims.create({ key: 'animalcontrol-hurt',   frames: anims.generateFrameNumbers('animal-control', { start: 8, end: 8 }), frameRate: 6,  repeat: 0  })

    // Zookeeper boss — 8 frames (192×355): 0-4 walk, 5-6 attack, 7 hurt
    anims.create({ key: 'zookeeper-walk',   frames: anims.generateFrameNumbers('zookeeper', { start: 0, end: 4 }), frameRate: 7,  repeat: -1 })
    anims.create({ key: 'zookeeper-attack', frames: anims.generateFrameNumbers('zookeeper', { start: 5, end: 6 }), frameRate: 9,  repeat: 0  })
    anims.create({ key: 'zookeeper-hurt',   frames: anims.generateFrameNumbers('zookeeper', { start: 7, end: 7 }), frameRate: 6,  repeat: 0  })

    // SoR grunt — 6 cols × 3 rows, 76×88
    // Frames 4, 11, 16, 17 are corrupt (empty/test pattern/ripper credits) — skipped
    anims.create({ key: 'sor-walk',      frames: anims.generateFrameNumbers('sor-enemy', { start: 0,  end: 3  }), frameRate: 8,  repeat: -1 })
    anims.create({ key: 'sor-attack',    frames: anims.generateFrameNumbers('sor-enemy', { start: 6,  end: 10 }), frameRate: 10, repeat: 0  })
    anims.create({ key: 'sor-hurt',      frames: anims.generateFrameNumbers('sor-enemy', { start: 12, end: 13 }), frameRate: 8,  repeat: 0  })
    anims.create({ key: 'sor-knockdown', frames: anims.generateFrameNumbers('sor-enemy', { start: 14, end: 15 }), frameRate: 8,  repeat: 0  })
    anims.create({ key: 'sor-down',      frames: anims.generateFrameNumbers('sor-enemy', { start: 15, end: 15 }), frameRate: 2,  repeat: -1 })

    // SoR boss — Zamza (76×82, 10c×8r = 80 frames)
    anims.create({ key: 'zamza-walk',   frames: anims.generateFrameNumbers('sor-boss-zamza', { start: 0,  end: 9  }), frameRate: 8,  repeat: -1 })
    anims.create({ key: 'zamza-attack', frames: anims.generateFrameNumbers('sor-boss-zamza', { start: 20, end: 27 }), frameRate: 10, repeat: 0  })
    anims.create({ key: 'zamza-hurt',   frames: anims.generateFrameNumbers('sor-boss-zamza', { start: 50, end: 54 }), frameRate: 8,  repeat: 0  })

    // SoR boss — Gunner (104×104, 4c×8r = 32 frames)
    // Frames 2 and 3 of jack are corrupt/empty — walk uses only 0-1
    anims.create({ key: 'jack-walk',   frames: anims.generateFrameNumbers('sor-boss-jack', { start: 0,  end: 1  }), frameRate: 7,  repeat: -1 })
    anims.create({ key: 'jack-attack', frames: anims.generateFrameNumbers('sor-boss-jack', { start: 12, end: 17 }), frameRate: 10, repeat: 0  })
    anims.create({ key: 'jack-hurt',   frames: anims.generateFrameNumbers('sor-boss-jack', { start: 20, end: 23 }), frameRate: 8,  repeat: 0  })

    anims.create({ key: 'hit-spark',      frames: anims.generateFrameNumbers('hit-effects',    { start: 0, end: 3 }), frameRate: 16, repeat: 0 })
    anims.create({ key: 'boss-shockwave', frames: anims.generateFrameNumbers('boss-shockwave', { start: 0, end: 3 }), frameRate: 12, repeat: 0 })
    anims.create({ key: 'boss-fx-ring',   frames: anims.generateFrameNumbers('boss-fx-ring',   { start: 0, end: 3 }), frameRate: 12, repeat: 0 })
    anims.create({ key: 'boss-fx-fire',   frames: anims.generateFrameNumbers('boss-fx-fire',   { start: 0, end: 3 }), frameRate: 12, repeat: 0 })

    // ── UV inset: add 0.5px inset to all spritesheet frames to prevent sub-pixel bleed ──
    // Boundary pixels are transparent, so inset causes zero visible content loss.
    const sheetsToFix = [
      'punch-walk','punch-attack','punch-kick','punch-hurt','punch-special',
      'gorilla-walk','gorilla-slam','gorilla-attack','gorilla-chest',
      'macaque-walk','macaque-attack','macaque-hurt',
      'hit-effects','boss-shockwave','boss-fx-ring','boss-fx-fire',
    ]
    // Force NEAREST-neighbour filtering on gorilla textures (belt + suspenders on top of pixelArt:true)
    // Prevents sub-pixel bilinear bleed when the boss is scaled to 1.33×
    ;['gorilla-walk','gorilla-slam','gorilla-attack','gorilla-chest'].forEach(key => {
      if (this.textures.exists(key)) {
        this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST)
      }
    })

    sheetsToFix.forEach(key => {
      if (!this.textures.exists(key)) return
      const tex = this.textures.get(key)
      const tw  = tex.source[0].width
      const th  = tex.source[0].height
      const eu  = 0.5 / tw
      const ev  = 0.5 / th
      Object.values(tex.frames).forEach(f => {
        if (f.name === '__BASE') return
        f.u0 += eu; f.u1 -= eu
        f.v0 += ev; f.v1 -= ev
      })
    })
  }
}
