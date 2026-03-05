export default class TransitionScene extends Phaser.Scene {
  constructor() { super('Transition') }

  init(data) {
    this.levelName = data.levelName || ''
    this.levelNum  = data.levelNum  || 1
    this.zone      = data.zone      || ''
  }

  create() {
    const { width, height } = this.scale

    // Dark purple bg
    this.add.rectangle(0, 0, width, height, 0x07061a).setOrigin(0, 0)
    this.add.rectangle(0, 0, width, 3, 0xff8c00, 0.7).setOrigin(0, 0)

    // Level number
    this.add.text(width / 2, height / 2 - 60, `LEVEL ${this.levelNum}`, {
      fontSize: '18px', fontFamily: 'monospace', color: '#ff8c00', letterSpacing: 6
    }).setOrigin(0.5)

    // Level name
    this.add.text(width / 2, height / 2, this.levelName.toUpperCase(), {
      fontSize: '42px', fontFamily: 'monospace', color: '#ffffff', letterSpacing: 4,
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5)

    // Divider
    this.add.rectangle(width / 2, height / 2 + 40, 400, 2, 0xff8c00, 0.5).setOrigin(0.5)

    // Zone label
    const zoneLabels = { zoo: 'ICHIKAWA CITY ZOO', escape: 'THE GATES', enroute: 'NEON STREETS', forest: 'THE CEDAR FOREST' }
    this.add.text(width / 2, height / 2 + 62, zoneLabels[this.zone] || '', {
      fontSize: '14px', fontFamily: 'monospace', color: '#888899', letterSpacing: 4
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
