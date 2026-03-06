/**
 * LoreScene — inter-zone narrative bridge.
 * Fires after levels 4, 8, 12.
 * Punch-kun walks across a dark screen while lore text scrolls.
 */

const ACTS = {
  4: [
    'The last gate fell behind him.',
    '',
    'He didn\'t look back.',
    '',
    'Beyond the zoo: pavement and neon.',
    'Sirens in the distance. The city never slept.',
    '',
    'The city waited.',
    'He\'d heard it smelled like exhaust and ambition.',
    'He didn\'t care.',
    '',
    'Something in his chest beat faster.',
    'He tightened his grip on the toy.',
    '',
    '— ONWARD —',
  ],
  8: [
    'The city tried to swallow him.',
    '',
    'Alleys. Construction dust.',
    'Men with whistles. Lights that never went out.',
    '',
    'He ran when he had to.',
    'He hid when he had to.',
    '',
    'He kept the toy pressed to his chest.',
    'He kept moving.',
    '',
    'Then the buildings thinned.',
    'The sky showed through.',
    '',
    '— THE EDGE OF TOWN —',
  ],
  12: [
    'The streets ended where the trees began.',
    '',
    'No signs. No fences.',
    'No one to tell him he couldn\'t.',
    '',
    'He stopped for the first time.',
    '',
    'The forest asked nothing of him.',
    'No cages. No keys. No names.',
    '',
    'He breathed.',
    '',
    'Somewhere above, a bird called.',
    'Somewhere ahead, the path went on.',
    '',
    '— HOME —',
  ],
}

export default class LoreScene extends Phaser.Scene {
  constructor() { super('Lore') }

  init(data) {
    this.afterLevel = data.afterLevel || 4
    this.nextLevel  = data.nextLevel  || 5
    this.score      = data.score      || 0
    this.lives      = data.lives      || 3
  }

  create() {
    // ── Preload next zone's music while player reads story ──
    const toLoad = {
      4: [['music-city1', 'assets/audio/music-city1.mp3'], ['music-city2', 'assets/audio/music-city2.mp3']],
      8: [
        ['music-forest1',    'assets/audio/music-forest1.mp3'],
        ['music-forest2',    'assets/audio/music-forest2.mp3'],
        ['music-boss-final', 'assets/audio/music-boss-final.mp3'],
        ['music-credits',    'assets/audio/music-credits.mp3'],
      ],
      12: [],
    }[this.afterLevel] || []

    toLoad.forEach(([key, path]) => {
      if (!this.cache.audio.exists(key)) {
        this.load.audio(key, path)
      }
    })
    if (toLoad.length) this.load.start()

    const { width, height } = this.scale
    const lines = ACTS[this.afterLevel] || ACTS[4]

    // Full black base
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0, 0)

    // Subtle dark forest bg tint
    this.add.rectangle(0, 0, width, height, 0x050f02, 0.92).setOrigin(0, 0)

    // Punch-kun walks left → right across the lower third
    const walkY   = height * 0.72
    const startX  = -120
    const endX    = width + 120
    const walkDur = 9000   // ms to cross the screen

    if (this.textures.exists('punch-walk')) {
      const pk = this.add.sprite(startX, walkY, 'punch-walk').setScale(1.4).setDepth(10)
      if (this.anims.exists('punch-walk')) pk.play('punch-walk')

      this.tweens.add({
        targets:  pk,
        x:        endX,
        duration: walkDur,
        ease:     'Linear',
      })
    }

    // Lore text — fades in line by line from centre
    const textY   = height * 0.28
    const lineH   = 34
    const totalH  = lines.length * lineH
    const startTY = textY - totalH / 2

    lines.forEach((line, i) => {
      const txt = this.add.text(width / 2, startTY + i * lineH, line, {
        fontSize:        line.length === 0 ? '8px' : '16px',
        fontFamily:      'monospace',
        color:           '#c8d4b8',
        stroke:          '#000000',
        strokeThickness: 1,
        align:           'center',
      }).setOrigin(0.5).setAlpha(0).setDepth(5)

      this.tweens.add({
        targets:  txt,
        alpha:    1,
        duration: 700,
        delay:    800 + i * 420,
        ease:     'Linear',
      })
    })

    // Auto-advance after walk + a beat
    const totalDur = Math.max(walkDur + 1200, lines.length * 420 + 2800)
    this.time.delayedCall(totalDur, () => this._advance())

    // Skip on tap/key (with brief lockout)
    this.time.delayedCall(1200, () => {
      this.input.once('pointerdown', () => this._advance())
      if (this.input.keyboard) this.input.keyboard.once('keydown', () => this._advance())
    })

    // "tap to skip" hint
    const hint = this.add.text(width - 14, height - 14, 'SKIP →', {
      fontSize: '10px', fontFamily: 'monospace', color: '#2a4a18',
    }).setOrigin(1, 1).setDepth(10)
    this.tweens.add({ targets: hint, alpha: 0.3, duration: 1000, yoyo: true, repeat: -1 })

    this.cameras.main.fadeIn(800, 0, 0, 0)
    this._advanced = false
  }

  _advance() {
    if (this._advanced) return
    this._advanced = true
    this.tweens.killAll()
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UI')
      if (this.nextLevel == null) {
        this.scene.start('Win', { score: this.score })
      } else {
        this.scene.start('Game', {
          level: this.nextLevel,
          score: this.score,
          lives: this.lives,
        })
      }
    })
  }
}
