export default class WinScene extends Phaser.Scene {
  constructor() { super('Win') }

  init(data) { this.finalScore = data.score || 0 }

  create() {
    const { width, height } = this.scale

    // Forest background
    if (this.textures.exists('bg-forest')) {
      this.add.image(0, 0, 'bg-forest').setOrigin(0, 0).setDisplaySize(width, height)
    } else {
      this.add.rectangle(0, 0, width, height, 0x0a1a06).setOrigin(0, 0)
    }
    this.add.rectangle(0, 0, width, height, 0x000000, 0.72).setOrigin(0, 0)

    // Subtle orange bottom glow
    const glow = this.add.graphics()
    glow.fillGradientStyle(0xff6600, 0xff6600, 0xff6600, 0xff6600, 0, 0, 0.14, 0.14)
    glow.fillRect(0, height * 0.75, width, height * 0.25)

    const lines = [
      { text: '',                                        size: 16, color: '#ccccdd' },
      { text: '',                                        size: 16, color: '#ccccdd' },
      { text: '',                                        size: 16, color: '#ccccdd' },
      { text: 'He made it.',                             size: 18, color: '#ccccdd' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'Through the zoo gates.',                  size: 16, color: '#ccccdd' },
      { text: 'Past the neon streets.',                  size: 16, color: '#ccccdd' },
      { text: 'Through the cedar forest.',               size: 16, color: '#ccccdd' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'The toy never left his arms.',            size: 16, color: '#ccccdd' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'PUNCH-KUN IS FREE.',                      size: 32, color: '#ffcc00' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: `FINAL SCORE: ${this.finalScore}`,         size: 20, color: '#d4a020' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━',              size: 12, color: '#3a6010' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'A  P U N C H - K U N  G A M E',          size: 14, color: '#8acc44' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━',              size: 12, color: '#3a6010' },
      { text: '',                                        size: 18, color: '#ccccdd' },
      { text: 'CONCEPT & DESIGN',                        size: 12, color: '#8acc44' },
      { text: 'J.',                                      size: 16, color: '#ffffff' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'ENGINE',                                  size: 12, color: '#8acc44' },
      { text: 'Phaser 3',                                size: 14, color: '#ffffff' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'ART',                                     size: 12, color: '#8acc44' },
      { text: 'Hand-crafted pixel souls',                size: 14, color: '#ffffff' },
      { text: '',                                        size: 14, color: '#ccccdd' },
      { text: 'SPECIAL THANKS',                          size: 12, color: '#8acc44' },
      { text: 'To everyone who played.',                 size: 14, color: '#ffffff' },
      { text: 'To the toy that started it all.',         size: 14, color: '#ffffff' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━',              size: 12, color: '#3a6010' },
      { text: '',                                        size: 18, color: '#ccccdd' },
      // Easter egg — cryptic, only those who know will know
      { text: 'somewhere between the static',            size: 11, color: '#2a4a18' },
      { text: 'and the signal —',                        size: 11, color: '#2a4a18' },
      { text: 'where the jazz dissolves into the moon,', size: 11, color: '#2a4a18' },
      { text: 'a name no cage could hold.',              size: 11, color: '#2a4a18' },
      { text: '',                                        size: 18, color: '#ccccdd' },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━',              size: 12, color: '#3a6010' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '',                                        size: 24, color: '#ccccdd' },
      { text: '',                                        size: 24, color: '#ccccdd' },
    ]

    const lineHeight = 30
    const startY     = height + 20
    const group      = this.add.container(0, 0)

    lines.forEach(({ text, size, color }, i) => {
      group.add(
        this.add.text(width / 2, startY + i * lineHeight, text, {
          fontSize: `${size}px`, fontFamily: 'monospace', color,
          stroke: '#000000', strokeThickness: size >= 24 ? 3 : 1,
          align: 'center',
        }).setOrigin(0.5, 0)
      )
    })

    const totalScroll = lines.length * lineHeight + height + 60
    this.scrollTween = this.tweens.add({
      targets:  group,
      y:        -totalScroll,
      duration: 34000,
      ease:     'Linear',
      onComplete: () => this.showPlayAgain(),
    })

    // Skip
    const skipTxt = this.add.text(width - 14, height - 14, 'SKIP →', {
      fontSize: '11px', fontFamily: 'monospace', color: '#3a6010',
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(1, 1).setDepth(10)
    this.tweens.add({ targets: skipTxt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 })

    const skip = () => { this.scrollTween?.stop(); this.showPlayAgain() }
    this.input.keyboard.once('keydown', skip)
    this.input.once('pointerdown', skip)

    this.cameras.main.fadeIn(800, 0, 0, 0)
  }

  showPlayAgain() {
    this.tweens.killAll()
    const { width, height } = this.scale

    const card = this.add.rectangle(width / 2, height / 2, 340, 60, 0x162808).setOrigin(0.5).setInteractive()
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
