export default class TitleScene extends Phaser.Scene {
  constructor() { super('Title') }

  create() {
    const { width, height } = this.scale

    // ── BACKGROUND ──
    if (this.textures.exists('title-bg')) {
      this.add.image(width / 2, height / 2, 'title-bg').setDisplaySize(width, height)
    } else {
      this.add.rectangle(0, 0, width, height, 0x07061a).setOrigin(0, 0)
    }

    // Subtle top overlay — keeps title text readable without a harsh band
    const grad = this.add.graphics()
    grad.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.55, 0.55, 0, 0)
    grad.fillRect(0, 0, width, height * 0.50)

    // ── PUNCH-KUN HERO SPRITE ──
    // Pin feet to the visual ground (~85% down the canvas)
    const groundY = height * 0.85
    if (this.textures.exists('punch-idle')) {
      const pk = this.add.image(0, 0, 'punch-idle')
      const targetH = height * 0.36
      pk.setScale(targetH / pk.height)
      // anchor feet at groundY: center = groundY - half display height
      pk.setPosition(width / 2, groundY - (pk.displayHeight / 2))
    }

    // ── TITLE TEXT ──
    // Monkey top is ~49% (85% - 36%), so titles sit above that
    this.add.text(width / 2, height * 0.30, 'PUNCH-KUN', {
      fontSize: '64px',
      fontFamily: 'monospace',
      color: '#ffcc00',
      stroke: '#cc6600',
      strokeThickness: 5,
    }).setOrigin(0.5)

    this.add.text(width / 2, height * 0.39, '不 撓 の パンチくん', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#cccccc',
    }).setOrigin(0.5)

    // ── PROMPT ──
    const prompt = this.add.text(width / 2, height * 0.88, 'PRESS ENTER OR CLICK TO PLAY', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffdd88',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5)
    this.tweens.add({ targets: prompt, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 })

    // ── CONTROLS GUIDE ──
    const controls = ['← → ↑ ↓  MOVE', 'Z  PUNCH   X  KICK', 'A  SPECIAL   P  PAUSE']
    controls.forEach((line, i) => {
      this.add.text(width / 2, height * 0.92 + (i * 14), line, {
        fontSize: '11px', fontFamily: 'monospace', color: '#888888'
      }).setOrigin(0.5)
    })

    // ── START ──
    // First user gesture unlocks the Web Audio context — start music here, not on load
    const startGame = () => {
      // Press-start SFX
      if (this.cache.audio.exists('sfx-press-start')) {
        this.sound.play('sfx-press-start', { volume: 0.85 })
      }

      // Title music — destroy any previous instance before creating (handles re-entry from GameOver)
      if (this.game._titleMusic) {
        this.game._titleMusic.destroy()
        this.game._titleMusic = null
      }
      if (this.cache.audio.exists('music-title')) {
        const music = this.sound.add('music-title', { loop: true, volume: 0.5 })
        music.play()
        this.game._titleMusic = music
      }

      // Brief pause so press-start is audible before scene change
      this.time.delayedCall(500, () => this.scene.start('Story'))
    }

    this.input.keyboard.once('keydown-ENTER', startGame)
    this.input.once('pointerdown', startGame)

    this.cameras.main.fadeIn(800, 0, 0, 0)
  }
}
