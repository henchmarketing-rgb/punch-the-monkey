export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver') }

  init(data) { this.finalScore = data.score || 0 }

  create() {
    const { width, height } = this.scale

    // Title screen bg with dark overlay for mood
    if (this.textures.exists('title-bg')) {
      this.add.image(width / 2, height / 2, 'title-bg').setDisplaySize(width, height)
    } else {
      this.add.rectangle(0, 0, width, height, 0x07061a).setOrigin(0, 0)
    }
    this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0, 0)
    this.add.rectangle(0, 0, width, 3, 0xff8c00, 0.7).setOrigin(0, 0)

    // K.O. text
    this.add.text(width / 2, 120, 'K.O.', {
      fontSize: '80px', fontFamily: 'monospace', color: '#ff8c00',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5)

    // Punch-kun sprite — centered, greyed out, slumped
    if (this.textures.exists('punch-idle')) {
      const pk = this.add.image(width / 2, height * 0.52, 'punch-idle')
      const targetH = height * 0.32
      pk.setScale(targetH / pk.height).setTint(0x666666)
    }

    // Score
    this.add.text(width / 2, height * 0.72, `FINAL SCORE: ${this.finalScore}`, {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffcc00'
    }).setOrigin(0.5)

    // Buttons
    const makeBtn = (x, y, label, cb) => {
      const bg = this.add.rectangle(x, y, 260, 54, 0x1a0a2e).setOrigin(0.5).setInteractive()
      bg.setStrokeStyle(1, 0xff8c00)
      const tx = this.add.text(x, y, label, { fontSize: '16px', fontFamily: 'monospace', color: '#ffffff' }).setOrigin(0.5)
      bg.on('pointerover',  () => bg.setFillStyle(0x2e1848))
      bg.on('pointerout',   () => bg.setFillStyle(0x1a0a2e))
      bg.on('pointerdown',  cb)
    }

    makeBtn(width / 2 - 160, height * 0.86, 'TRY AGAIN', () => this.scene.start('Game', { level: 1, score: 0 }))
    makeBtn(width / 2 + 160, height * 0.86, 'TITLE',     () => this.scene.start('Title'))

    this.cameras.main.fadeIn(500, 0, 0, 0)
  }
}
