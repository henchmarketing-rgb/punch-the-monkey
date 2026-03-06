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

    // === EFFECTS ===
    this.load.spritesheet('hit-effects',    'assets/sprites/hit-effects.png',    { frameWidth: 144, frameHeight: 144 })
    this.load.spritesheet('boss-shockwave', 'assets/sprites/boss-shockwave.png', { frameWidth: 414, frameHeight: 240 })
    this.load.spritesheet('boss-fx-ring',   'assets/sprites/boss-fx-ring.png',   { frameWidth: 288, frameHeight: 288 })
    this.load.spritesheet('boss-fx-fire',   'assets/sprites/boss-fx-fire.png',   { frameWidth: 288, frameHeight: 288 })

    // === AUDIO ===
    // Music
    this.load.audio('music-title',  'assets/audio/music-title.mp3')
    this.load.audio('music-level1',  'assets/audio/music-level1.mp3')
    this.load.audio('music-level2',  'assets/audio/music-level2.mp3')
    this.load.audio('music-forest1', 'assets/audio/music-forest1.mp3')
    this.load.audio('music-forest2', 'assets/audio/music-forest2.mp3')
    this.load.audio('music-boss',   'assets/audio/music-boss.mp3')
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
    this.load.image('bg-zoo',    'assets/backgrounds/bg-zoo.png')
    this.load.image('bg-zoo2',   'assets/backgrounds/bg-zoo2.png')
    // bg-zoo3 pending
    this.load.image('bg-zoo4',   'assets/backgrounds/bg-zoo4.png')

    // Zone 2 — Escape
    this.load.image('bg-escape',  'assets/backgrounds/bg-escape.png')
    // bg-escape2 pending
    this.load.image('bg-escape3', 'assets/backgrounds/bg-escape3.png')
    // bg-escape4 pending

    // Zone 3 — Streets
    this.load.image('bg-street',  'assets/backgrounds/bg-street.png')
    this.load.image('bg-street2', 'assets/backgrounds/bg-street2.png')
    // bg-street3 pending
    // bg-street4 pending

    // Zone 4 — Forest
    this.load.image('bg-forest',  'assets/backgrounds/bg-forest.png')
    this.load.image('bg-forest2', 'assets/backgrounds/bg-forest2.png')
    // bg-forest3 pending
    this.load.image('bg-forest4', 'assets/backgrounds/bg-forest4.png')
    this.load.image('title-bg',  'assets/ui/title-bg.png')
    this.load.image('banana',    'assets/items/banana.png')

    // Fallback
    this.createFallbackBG()

    this.load.on('loaderror', (file) => console.warn('Asset load error:', file.key))
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
