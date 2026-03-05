export default class WinScene extends Phaser.Scene {
  constructor() { super('Win') }

  init(data) { this.finalScore = data.score || 0 }

  create() {
    const { width, height } = this.scale

    this.add.rectangle(0, 0, width, height, 0x07061a).setOrigin(0, 0)
    for (let i = 0; i < 80; i++) {
      this.add.rectangle(
        Phaser.Math.Between(0, width), Phaser.Math.Between(0, height),
        1, 1, 0xffffff, Phaser.Math.FloatBetween(0.1, 0.6)
      )
    }
    this.add.rectangle(0, 0, width, 3, 0xff8c00, 0.7).setOrigin(0, 0)

    const lines = [
      '', '', '', '',
      'He made it.',
      '',
      'Through the zoo gates.',
      'Past the neon streets.',
      'Into the cedar forest.',
      '',
      'The toy never left his arms.',
      '',
      'PUNCH-KUN IS FREE.',
      '', '',
      `FINAL SCORE: ${this.finalScore}`,
      '', '', '',
    ]

    const lineHeight = 26
    const startY = height + 10
    const group  = this.add.container(0, 0)

    lines.forEach((line, i) => {
      const isBig = ['PUNCH-KUN IS FREE.'].includes(line)
      const isScore = line.startsWith('FINAL')
      const txt = this.add.text(width / 2, startY + i * lineHeight, line, {
        fontSize: isBig ? '28px' : '18px',
        fontFamily: 'monospace',
        color: isBig ? '#ff8c00' : (isScore ? '#ffcc00' : '#aaaacc'),
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
      fontSize: '11px', fontFamily: 'monospace', color: '#444466'
    }).setOrigin(1, 1).setDepth(10)

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  showPlayAgain() {
    this.tweens.killAll()
    const { width, height } = this.scale
    const bg = this.add.rectangle(width / 2, height / 2, 300, 60, 0x1a0a2e).setOrigin(0.5).setInteractive()
    bg.setStrokeStyle(1, 0xff8c00)
    this.add.text(width / 2, height / 2, 'PLAY AGAIN', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ff8c00'
    }).setOrigin(0.5)
    bg.on('pointerdown', () => this.scene.start('Game', { level: 1, score: 0 }))
  }
}
