export default class TransitionScene extends Phaser.Scene {
  constructor() { super('Transition') }

  init(data) {
    this.levelName = data.levelName || ''
    this.levelNum  = data.levelNum  || 1
    this.zone      = data.zone      || ''
  }

  create() {
    const { width, height } = this.scale

    // Dark bark background
    this.add.rectangle(0, 0, width, height, 0x1a0e05).setOrigin(0, 0)

    // Vine border lines — top and bottom
    const gfx = this.add.graphics()
    gfx.lineStyle(2, 0x3da820, 0.8)
    gfx.lineBetween(0, 2, width, 2)
    gfx.lineBetween(0, height - 2, width, height - 2)

    // Leaf corner accents
    gfx.fillStyle(0x3da820, 0.6)
    gfx.fillEllipse(30, 20, 44, 16)
    gfx.fillEllipse(width - 30, 20, 44, 16)
    gfx.fillEllipse(30, height - 20, 44, 16)
    gfx.fillEllipse(width - 30, height - 20, 44, 16)

    // LEVEL N
    this.add.text(width / 2, height / 2 - 68, `LEVEL ${this.levelNum}`, {
      fontSize: '14px', fontFamily: 'monospace', color: '#4a8a18', letterSpacing: 8,
    }).setOrigin(0.5)

    // Level name — jungle gold
    this.add.text(width / 2, height / 2 - 16, this.levelName.toUpperCase(), {
      fontSize: '44px', fontFamily: 'monospace', color: '#d4a020', letterSpacing: 4,
      stroke: '#0a0804', strokeThickness: 4,
    }).setOrigin(0.5)

    // Vine divider
    gfx.lineStyle(1, 0x3da820, 0.5)
    gfx.lineBetween(width / 2 - 220, height / 2 + 36, width / 2 + 220, height / 2 + 36)

    // Zone label
    const zoneLabels = {
      zoo:     'ICHIKAWA CITY ZOO',
      escape:  'THE GATES',
      enroute: 'NEON STREETS',
      forest:  'THE CEDAR FOREST',
    }
    this.add.text(width / 2, height / 2 + 58, zoneLabels[this.zone] || '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#4a7a18', letterSpacing: 5,
    }).setOrigin(0.5)

    // Fade in → hold → fade out → stop self
    this.cameras.main.fadeIn(400, 0, 0, 0)
    this.time.delayedCall(2200, () => {
      this.cameras.main.fadeOut(400, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.stop())
    })

    // Skippable
    this.input.keyboard.once('keydown', () => this.scene.stop())
    this.input.once('pointerdown',      () => this.scene.stop())
  }
}
