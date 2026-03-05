export default class WinScene extends Phaser.Scene {
  constructor() { super('Win') }

  init(data) { this.finalScore = data.score || 0 }

  create() {
    const { width, height } = this.scale

    // Dark bark background
    this.add.rectangle(0, 0, width, height, 0x1a0e05).setOrigin(0, 0)

    // Scattered leaf particles
    const gfx = this.add.graphics()
    for (let i = 0; i < 60; i++) {
      const alpha = Phaser.Math.FloatBetween(0.05, 0.25)
      const color = [0x3da820, 0x4a8a18, 0xd4a020][Math.floor(Math.random() * 3)]
      gfx.fillStyle(color, alpha)
      gfx.fillEllipse(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(4, 14),
        Phaser.Math.Between(2, 6),
      )
    }

    // Vine border
    gfx.lineStyle(2, 0x3da820, 0.7)
    gfx.lineBetween(0, 2, width, 2)
    gfx.lineBetween(0, height - 2, width, height - 2)

    const lines = [
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: 'He made it.',             size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: 'Through the zoo gates.',  size: 18, color: '#ccccdd' },
      { text: 'Past the neon streets.',  size: 18, color: '#ccccdd' },
      { text: 'Into the cedar forest.',  size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: 'The toy never left his arms.', size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: 'PUNCH-KUN IS FREE.',      size: 30, color: '#ffcc00' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: `FINAL SCORE: ${this.finalScore}`, size: 20, color: '#d4a020' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
      { text: '',                        size: 18, color: '#ccccdd' },
    ]

    const lineHeight = 28
    const startY     = height + 10
    const group      = this.add.container(0, 0)

    lines.forEach(({ text, size, color }, i) => {
      const txt = this.add.text(width / 2, startY + i * lineHeight, text, {
        fontSize: `${size}px`, fontFamily: 'monospace', color,
        stroke: '#0a0804', strokeThickness: text === 'PUNCH-KUN IS FREE.' ? 3 : 0,
        align: 'center',
      }).setOrigin(0.5, 0)
      group.add(txt)
    })

    this.tweens.add({
      targets: group,
      y: -(lines.length * lineHeight + 100),
      duration: 18000,
      ease: 'Linear',
      onComplete: () => this.showPlayAgain(),
    })

    this.input.keyboard.once('keydown', () => this.showPlayAgain())
    this.input.once('pointerdown',      () => this.showPlayAgain())

    this.add.text(width - 12, height - 12, 'SKIP →', {
      fontSize: '11px', fontFamily: 'monospace', color: '#3a6010',
    }).setOrigin(1, 1).setDepth(10)

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  showPlayAgain() {
    this.tweens.killAll()
    const { width, height } = this.scale

    // Jungle card
    const card = this.add.rectangle(width / 2, height / 2, 320, 70, 0x162808).setOrigin(0.5).setInteractive()
    card.setStrokeStyle(2, 0x3da820)

    this.add.text(width / 2, height / 2, 'PLAY AGAIN', {
      fontSize: '22px', fontFamily: 'monospace', color: '#8acc44',
      stroke: '#0a0804', strokeThickness: 2,
    }).setOrigin(0.5)

    card.on('pointerover',  () => card.setFillStyle(0x223a10))
    card.on('pointerout',   () => card.setFillStyle(0x162808))
    card.on('pointerdown',  () => this.scene.start('Game', { level: 1, score: 0, lives: 3 }))
  }
}
