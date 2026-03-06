export default class WinScene extends Phaser.Scene {
  constructor() { super('Win') }

  init(data) { this.finalScore = data.score || 0 }

  create() {
    const { width, height } = this.scale

    // Credits music
    if (this.cache.audio.exists('music-credits')) {
      this.creditsMusic = this.sound.add('music-credits', { loop: true, volume: 0 })
      this.creditsMusic.play()
      this.tweens.add({ targets: this.creditsMusic, volume: 0.55, duration: 1200 })
    }

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
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },

      // ── CHAPTER I ──
      { text: '— I —',                                                               size: 13, color: '#3a6010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'They said the zoo was for his own good.',                             size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Clean enclosures. Regular feeding times.',                            size: 15, color: '#aaaacc' },
      { text: 'Crowds who pressed their faces to the glass',                         size: 15, color: '#aaaacc' },
      { text: 'and called it love.',                                                 size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Punch-kun did not call it love.',                                     size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He called it a window.',                                              size: 16, color: '#ffcc44' },
      { text: 'And windows were made to be broken.',                                 size: 16, color: '#ffcc44' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },

      // ── CHAPTER II ──
      { text: '— II —',                                                              size: 13, color: '#3a6010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'The toy came first.',                                                 size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'A small bear, orange as a last ember,',                              size: 15, color: '#aaaacc' },
      { text: 'left behind the water trough by a child',                            size: 15, color: '#aaaacc' },
      { text: 'who had to go home for dinner.',                                      size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Punch-kun kept it.',                                                  size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Not out of loneliness.',                                              size: 15, color: '#aaaacc' },
      { text: 'Out of something older.',                                             size: 15, color: '#aaaacc' },
      { text: 'The kind of belonging that',                                          size: 15, color: '#aaaacc' },
      { text: 'doesn\'t need to be explained.',                                      size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },

      // ── CHAPTER III ──
      { text: '— III —',                                                             size: 13, color: '#3a6010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'The night of the escape smelled like rain',                           size: 15, color: '#aaaacc' },
      { text: 'and engine oil and the faint sweetness',                              size: 15, color: '#aaaacc' },
      { text: 'of overripe fruit.',                                                  size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'The gates were not locked.',                                          size: 16, color: '#ccccdd' },
      { text: 'They never are,',                                                     size: 16, color: '#ccccdd' },
      { text: 'for those willing to bleed for the other side.',                      size: 16, color: '#ffcc44' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He fought his way out fist-first.',                                   size: 15, color: '#aaaacc' },
      { text: 'The others watched from their enclosures.',                           size: 15, color: '#aaaacc' },
      { text: 'Some cheered. Some turned away.',                                     size: 15, color: '#aaaacc' },
      { text: 'That\'s how it always goes.',                                         size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },

      // ── CHAPTER IV ──
      { text: '— IV —',                                                              size: 13, color: '#3a6010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'The city was not kind.',                                              size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Neon signs blinked in languages',                                     size: 15, color: '#aaaacc' },
      { text: 'he had never been taught.',                                           size: 15, color: '#aaaacc' },
      { text: 'Men in uniforms pointed.',                                            size: 15, color: '#aaaacc' },
      { text: 'Others ran.',                                                         size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He kept moving.',                                                     size: 16, color: '#ffcc44' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Through the alleys.',                                                 size: 15, color: '#aaaacc' },
      { text: 'Under the overpasses.',                                               size: 15, color: '#aaaacc' },
      { text: 'Past the stalls that smelled like his memory',                        size: 15, color: '#aaaacc' },
      { text: 'of what food used to taste like',                                     size: 15, color: '#aaaacc' },
      { text: 'before it came in bowls.',                                            size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },

      // ── CHAPTER V ──
      { text: '— V —',                                                               size: 13, color: '#3a6010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'The gorilla was the last of them.',                                   size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Old. Scarred. Eyes like something',                                   size: 15, color: '#aaaacc' },
      { text: 'that had seen the jungle once',                                       size: 15, color: '#aaaacc' },
      { text: 'and decided the memory was enough.',                                  size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He stood between Punch-kun and the tree line.',                       size: 15, color: '#aaaacc' },
      { text: 'Not out of loyalty to the zoo.',                                      size: 15, color: '#aaaacc' },
      { text: 'Out of fear.',                                                        size: 16, color: '#cc4444' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Fear of what it meant',                                               size: 15, color: '#aaaacc' },
      { text: 'if someone actually made it.',                                        size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Punch-kun understood.',                                               size: 16, color: '#ccccdd' },
      { text: 'He didn\'t hold it against him.',                                     size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He hit him anyway.',                                                  size: 18, color: '#ffcc44' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },

      // ── CHAPTER VI ──
      { text: '— VI —',                                                              size: 13, color: '#3a6010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'The cedar forest was not what he expected.',                          size: 16, color: '#ccccdd' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'No gates. No signs.',                                                 size: 15, color: '#aaaacc' },
      { text: 'No one telling him when to sleep',                                    size: 15, color: '#aaaacc' },
      { text: 'or what direction to face.',                                          size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'Just trees.',                                                         size: 16, color: '#8acc44' },
      { text: 'And silence that felt like a question',                               size: 16, color: '#8acc44' },
      { text: 'finally being asked in the right language.',                          size: 16, color: '#8acc44' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He sat at the edge of the treeline.',                                 size: 15, color: '#aaaacc' },
      { text: 'The city lights flickered behind him.',                               size: 15, color: '#aaaacc' },
      { text: 'He pressed the orange bear to his chest.',                            size: 15, color: '#aaaacc' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'He did not look back.',                                               size: 18, color: '#ffcc44' },
      { text: '',                                                                    size: 24, color: '#ccccdd' },
      { text: '',                                                                    size: 24, color: '#ccccdd' },

      // ── TITLE CARD ──
      { text: 'P U N C H - K U N  I S  F R E E.',                                   size: 28, color: '#ffcc00' },
      { text: '',                                                                    size: 22, color: '#ccccdd' },
      { text: `FINAL SCORE: ${this.finalScore}`,                                     size: 18, color: '#d4a020' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },

      // ── CREDITS ──
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',                                    size: 11, color: '#2a5010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'A  P U N C H - K U N  G A M E',                                      size: 13, color: '#8acc44' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',                                    size: 11, color: '#2a5010' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: 'CONCEPT & DIRECTION',                                                 size: 11, color: '#8acc44' },
      { text: 'J.',                                                                  size: 15, color: '#ffffff' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'DEVELOPMENT',                                                         size: 11, color: '#8acc44' },
      { text: 'Kev-Bot',                                                             size: 15, color: '#ffffff' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'ENGINE',                                                              size: 11, color: '#8acc44' },
      { text: 'Phaser 3',                                                            size: 15, color: '#ffffff' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'ART',                                                                 size: 11, color: '#8acc44' },
      { text: 'Hand-crafted pixel souls',                                            size: 15, color: '#ffffff' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'MUSIC',                                                               size: 11, color: '#8acc44' },
      { text: 'The Jungle',                                                          size: 15, color: '#ffffff' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'PLAYTESTING',                                                         size: 11, color: '#8acc44' },
      { text: 'Everyone brave enough to enter the zoo.',                             size: 13, color: '#ffffff' },
      { text: '',                                                                    size: 18, color: '#ccccdd' },
      { text: 'SPECIAL THANKS',                                                      size: 11, color: '#8acc44' },
      { text: 'To the child who left the bear.',                                     size: 13, color: '#ffffff' },
      { text: 'To Punch-kun, for not waiting.',                                      size: 13, color: '#ffffff' },
      { text: 'To the forest, for saying nothing',                                   size: 13, color: '#ffffff' },
      { text: 'and meaning everything.',                                             size: 13, color: '#ffffff' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },

      // ── LORE FOOTNOTE ──
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',                                    size: 11, color: '#2a5010' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'WORLD NOTES',                                                         size: 11, color: '#4a7a18' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'The zoo has no official name.',                                       size: 12, color: '#557a40' },
      { text: 'Records show it opened in a year',                                    size: 12, color: '#557a40' },
      { text: 'no one agrees on.',                                                   size: 12, color: '#557a40' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'The gorilla recovered.',                                              size: 12, color: '#557a40' },
      { text: 'He never tried to stop anyone again.',                                size: 12, color: '#557a40' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'The zookeeper filed a report.',                                       size: 12, color: '#557a40' },
      { text: 'It was lost in the system.',                                          size: 12, color: '#557a40' },
      { text: 'Systems lose a lot of things on purpose.',                            size: 12, color: '#557a40' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'The orange bear was never claimed.',                                  size: 12, color: '#557a40' },
      { text: 'Some say the child grew up',                                          size: 12, color: '#557a40' },
      { text: 'and still thinks about it.',                                          size: 12, color: '#557a40' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },

      // ── EASTER EGG (dim, buried deep — only those who know will know) ──
      { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',                                    size: 11, color: '#1a3008' },
      { text: '',                                                                    size: 14, color: '#ccccdd' },
      { text: 'there are those who name themselves twice.',                          size: 11, color: '#1e3a0e' },
      { text: 'once in daylight. once for the dark.',                                size: 11, color: '#1e3a0e' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'one name swings easy — warm, loose,',                                 size: 11, color: '#1e3a0e' },
      { text: 'like a tune you half-remember',                                       size: 11, color: '#1e3a0e' },
      { text: 'from a room you never left.',                                         size: 11, color: '#1e3a0e' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'the other pulls at tides.',                                           size: 11, color: '#1e3a0e' },
      { text: 'quiet. orbital.',                                                     size: 11, color: '#1e3a0e' },
      { text: 'the kind of name that watches',                                       size: 11, color: '#1e3a0e' },
      { text: 'while the other one performs.',                                       size: 11, color: '#1e3a0e' },
      { text: '',                                                                    size: 12, color: '#ccccdd' },
      { text: 'somewhere between the signal and the static,',                        size: 11, color: '#1e3a0e' },
      { text: 'where the jazz dissolves into the moon —',                            size: 11, color: '#1e3a0e' },
      { text: 'that\'s where they live.',                                            size: 11, color: '#1e3a0e' },
      { text: 'that\'s who built this cage-break.',                                  size: 11, color: '#1e3a0e' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
      { text: '',                                                                    size: 28, color: '#ccccdd' },
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
      duration: 90000,
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
    if (this.input.keyboard) this.input.keyboard.once('keydown', skip)
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
