export default class StoryScene extends Phaser.Scene {
  constructor() { super('Story') }

  create() {
    const { width, height } = this.scale

    // ── BACKGROUND — same dusk zoo as title screen ──
    if (this.textures.exists('title-bg')) {
      this.add.image(width / 2, height / 2, 'title-bg').setDisplaySize(width, height)
    } else {
      this.add.rectangle(0, 0, width, height, 0x07061a).setOrigin(0, 0)
    }

    // Dark overlay so text is readable over the background
    this.add.rectangle(0, 0, width, height, 0x000000, 0.68).setOrigin(0, 0)

    // Subtle orange bottom glow (brand accent)
    const glow = this.add.graphics()
    glow.fillGradientStyle(0xff6600, 0xff6600, 0xff6600, 0xff6600, 0, 0, 0.18, 0.18)
    glow.fillRect(0, height * 0.75, width, height * 0.25)

    // Story text lines
    const lines = [
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'ICHIKAWA CITY ZOO.',         size: 22, color: '#ffffff' },
      { text: 'MONKEY MOUNTAIN.',           size: 22, color: '#ffffff' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'A baby Japanese macaque',    size: 15, color: '#ccccdd' },
      { text: 'is born into captivity.',    size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'Abandoned by his mother',    size: 15, color: '#ccccdd' },
      { text: 'on his first day, he finds', size: 15, color: '#ccccdd' },
      { text: 'comfort in a small stuffed toy —', size: 15, color: '#ccccdd' },
      { text: 'an orange orangutan named',  size: 15, color: '#ccccdd' },
      { text: 'DJUNGELSKOG.',               size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'The zookeepers call him',    size: 15, color: '#ccccdd' },
      { text: 'PUNCH-KUN.',                 size: 22, color: '#ffcc00' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'They say he is safe here.', size: 15, color: '#ccccdd' },
      { text: 'They say the walls protect him.', size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'But Punch-kun knows the truth.', size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'Beyond the brick walls,',   size: 15, color: '#ccccdd' },
      { text: 'past the neon streets,',    size: 15, color: '#ccccdd' },
      { text: 'through the cedar forests —', size: 15, color: '#ccccdd' },
      { text: 'there is something the zoo', size: 15, color: '#ccccdd' },
      { text: 'can never give him.',        size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'FREEDOM.',                  size: 28, color: '#ff8c00' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'Tonight, Punch-kun escapes.', size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'He will fight every guard,', size: 15, color: '#ccccdd' },
      { text: 'every grunt, every boss',   size: 15, color: '#ccccdd' },
      { text: 'that stands between him',   size: 15, color: '#ccccdd' },
      { text: 'and the forest.',           size: 15, color: '#ccccdd' },
      { text: '',                           size: 14, color: '#aaaacc' },
      { text: 'And he will never,',        size: 15, color: '#ccccdd' },
      { text: 'ever drop the toy.',        size: 15, color: '#ccccdd' },
      { text: '',                           size: 18, color: '#aaaacc' },
      { text: '',                           size: 18, color: '#aaaacc' },
      { text: '— BEGIN YOUR ESCAPE —',     size: 20, color: '#ff8c00' },
      { text: '',                           size: 18, color: '#aaaacc' },
      { text: '',                           size: 18, color: '#aaaacc' },
    ]

    const lineHeight = 28
    const startY     = height + 20
    const totalH     = lines.length * lineHeight

    // Scrolling container
    this.textGroup = this.add.container(0, 0)
    lines.forEach((line, i) => {
      const txt = this.add.text(
        width / 2,
        startY + i * lineHeight,
        line.text,
        {
          fontSize:   `${line.size}px`,
          fontFamily: 'monospace',
          color:      line.color,
          align:      'center',
          stroke:     '#000000',
          strokeThickness: line.size >= 20 ? 3 : 2,
        }
      ).setOrigin(0.5, 0)
      this.textGroup.add(txt)
    })

    // Scroll tween — 28s total
    const endOffset = -(totalH + startY + 40)
    this.scrollTween = this.tweens.add({
      targets:    this.textGroup,
      y:          endOffset,
      duration:   28000,
      ease:       'Linear',
      onComplete: () => this.goToGame(),
    })

    // Punch-kun walking across the bottom (animated)
    if (this.textures.exists('punch-walk')) {
      const pk = this.add.sprite(-60, height - 55, 'punch-walk')
      pk.setScale(0.45).setTint(0x111133).setDepth(5)
      pk.play('punch-walk')
      this.tweens.add({ targets: pk, x: width + 80, duration: 28000, ease: 'Linear' })
    }

    // Skip hint
    const skipHint = this.add.text(width - 14, height - 14, 'SKIP →', {
      fontSize: '12px', fontFamily: 'monospace', color: '#666688',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 1).setDepth(10)
    this.tweens.add({ targets: skipHint, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 })

    // Skip on any key or click
    this.input.keyboard.once('keydown', () => this.skip())
    this.input.once('pointerdown',      () => this.skip())

    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  skip() {
    if (this.scrollTween) this.scrollTween.stop()
    this.cameras.main.fadeOut(300, 0, 0, 0)
    this.time.delayedCall(320, () => this.goToGame())
  }

  goToGame() {
    // Destroy title music before level music takes over
    if (this.game._titleMusic) {
      this.game._titleMusic.destroy()
      this.game._titleMusic = null
    }
    this.scene.start('Game', { level: 1 })
  }
}
