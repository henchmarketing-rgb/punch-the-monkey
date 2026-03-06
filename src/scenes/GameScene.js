import Player from '../entities/Player.js'
import Enemy  from '../entities/Enemy.js'
import Boss   from '../entities/Boss.js'
import { LEVELS } from '../config/levels.js'

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game') }

  init(data) {
    this.levelIndex      = (data.level || 1) - 1
    this.levelData       = LEVELS[this.levelIndex] || LEVELS[0]
    this.score           = data.score || 0
    this.lives           = data.lives !== undefined ? data.lives : 3
    this.wave            = 0      // advanceWave() increments before reading
    this.activeBossCount = 0      // tracks simultaneous bosses alive
    this.awaitingAdvance = false
  }

  create() {
    const { width, height } = this.scale
    this.worldW = Math.floor(width * 1.30)
    const worldW = this.worldW

    const bgKey = this.textures.exists(this.levelData.bg) ? this.levelData.bg : 'bg-zoo-fallback'
    this.bg = this.add.image(0, 0, bgKey).setOrigin(0, 0).setScrollFactor(1)

    this.walkTop    = Math.floor(height * 0.42)
    this.walkBottom = Math.floor(height * 0.93)
    const walkH = this.walkBottom - this.walkTop

    this.physics.world.setBounds(0, this.walkTop, worldW, walkH)
    this.cameras.main.setBounds(0, 0, worldW, height)

    this.player = new Player(this, width * 0.15, height * 0.80)
    this.player.body.setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.player, true, 0.18, 0.12)

    this.enemies = []
    this.boss    = null
    this.advanceWave()

    this.events.on('player-attack',  this.handlePlayerAttack,  this)
    this.events.on('player-special', this.handlePlayerSpecial, this)
    this.events.on('enemy-attack',   this.handleEnemyAttack,   this)
    this.events.on('player-ko',      this.onPlayerKO,          this)
    this.events.on('enemy-defeated', this.onEnemyDefeated,     this)
    this.events.on('boss-defeated',  this.onBossDefeated,      this)
    this.events.on('boss-shockwave', this.onBossShockwave,     this)

    // Music — level tracks cycle, boss music fires on boss spawn
    this._startLevelMusic()

    this.scene.launch('Transition', {
      levelName: this.levelData.name,
      levelNum:  this.levelData.id,
      zone:      this.levelData.zone,
    })
    this.scene.launch('UI', { levelData: this.levelData, player: this.player, lives: this.lives })
    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  // ── MUSIC ─────────────────────────────────────────────────────────────────

  _startLevelMusic() {
    const key = this.levelData.musicKey
    if (!key || !this.cache.audio.exists(key)) return
    this.sound.getAll(key).forEach(s => s.destroy())
    this.music = this.sound.add(key, { loop: true, volume: 0 })
    this.music.play()
    this.tweens.add({ targets: this.music, volume: 0.5, duration: 800 })
  }

  _startBossMusic() {
    if (!this.cache.audio.exists('music-boss')) return
    if (this.music) {
      this.tweens.add({
        targets: this.music, volume: 0, duration: 600,
        onComplete: () => { if (this.music) { this.music.destroy(); this.music = null } },
      })
    }
    this.bossMusic = this.sound.add('music-boss', { loop: true, volume: 0 })
    this.bossMusic.play()
    this.tweens.add({ targets: this.bossMusic, volume: 0.55, duration: 800 })
  }

  _resumeLevelMusic() {
    if (this.bossMusic) {
      this.tweens.add({
        targets: this.bossMusic, volume: 0, duration: 700,
        onComplete: () => { if (this.bossMusic) { this.bossMusic.destroy(); this.bossMusic = null } },
      })
    }
    this._startLevelMusic()
  }

  // ── SPAWNING ──────────────────────────────────────────────────────────────

  spawnWave(waveCfg) {
    if (!waveCfg) return
    this.pendingSpawns = (this.pendingSpawns || 0) + waveCfg.count

    for (let i = 0; i < waveCfg.count; i++) {
      this.time.delayedCall(i * 320, () => {
        if (!this.player?.active) { this.pendingSpawns = Math.max(0, this.pendingSpawns - 1); return }

        // 4-corner distribution: cycle through TL, TR, BL, BR
        const corner  = i % 4
        const fromLeft = corner === 0 || corner === 2
        const fromTop  = corner === 0 || corner === 1
        const spawnX = fromLeft ? -80 : this.worldW + 80
        const y      = fromTop
          ? Phaser.Math.Between(this.walkTop + 20,  this.walkTop  + 80)
          : Phaser.Math.Between(this.walkBottom - 80, this.walkBottom - 20)

        const e = new Enemy(this, spawnX, y, {
          texture:    'macaque-walk',
          walkAnim:   'macaque-walk',
          attackAnim: 'macaque-attack',
          hurtAnim:   'macaque-hurt',
          hp:     waveCfg.hp,
          speed:  waveCfg.speed,
          damage: waveCfg.damage,
        })
        e.setTarget(this.player)
        e.body.setCollideWorldBounds(true)
        this.enemies.push(e)
        this.pendingSpawns = Math.max(0, this.pendingSpawns - 1)
      })
    }
  }

  spawnBoss(offsetX = 0, hpMultiplier = 1) {
    const cam    = this.cameras.main
    const spawnX = Math.min(cam.scrollX + cam.width + 80 + offsetX, this.worldW - 30)
    const spawnY = Phaser.Math.Between(this.walkTop + 60, this.walkBottom - 40)
    const boss   = new Boss(this, spawnX, spawnY, { hpMultiplier })
    boss.setTarget(this.player)
    boss.body.setCollideWorldBounds(true)
    this.enemies.push(boss)
    return boss
  }

  spawnMultipleBosses(count, hpMultiplier = 1) {
    this.activeBossCount = count
    const bosses = []
    for (let i = 0; i < count; i++) {
      const offsetX = i * 220
      const boss = this.spawnBoss(offsetX, hpMultiplier)
      bosses.push(boss)
    }
    this.boss = bosses[0]
    return bosses[0]   // return first for cinematic panning
  }

  // ── WAVE RUNNER ───────────────────────────────────────────────────────────

  advanceWave() {
    this.wave++
    const entry = this.levelData.waves[this.wave - 1]

    if (!entry) {
      this.time.delayedCall(600, () => {
        this.awaitingAdvance = true
        this.events.emit('advance-prompt', true)
      })
      return
    }

    if (entry.boss) {
      this.time.delayedCall(700, () => {
        if (this.player) { this.player._frozen = true; this.player.body.setVelocity(0, 0) }
        const count       = entry.count || 1
        const isFinal     = entry.final || false
        const isEaster    = entry.easter || false
        const hpMult      = isFinal ? 1.5 : 1   // final boss gets extra HP on top of 3×
        const boss        = this.spawnMultipleBosses(count, hpMult)
        this.showBossIntro(boss, () => {
          if (this.player) this.player._frozen = false
        }, { count, isEaster, isFinal })
      })
    } else {
      this.time.delayedCall(1400, () => this.spawnWave(entry))
    }
  }

  // ── BOSS INTRO CINEMATIC ──────────────────────────────────────────────────

  showBossIntro(boss, onComplete, opts = {}) {
    const { width, height } = this.scale
    const cam = this.cameras.main
    const { count = 1, isEaster = false, isFinal = false } = opts

    const PAN_TO   = 1400
    const ZOOM_IN  = 1400
    const HOLD     = 2600
    const PAN_BACK = 1300
    const ZOOM_OUT = 1300

    this._startBossMusic()

    if (this.cache.audio.exists('sfx-boss-intro')) {
      this.sound.play('sfx-boss-intro', { volume: 0.85 })
    }

    cam.stopFollow()
    cam.pan(boss.x, boss.y, PAN_TO, 'Sine.easeInOut')
    cam.zoomTo(2.0, ZOOM_IN, 'Sine.easeInOut')

    this.time.delayedCall(PAN_TO, () => {
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
        .setScrollFactor(0).setDepth(900)

      this.tweens.add({
        targets: overlay, alpha: 0.78, duration: 350,
        onComplete: () => {
          cam.shake(800, 0.025)
          if (boss.anims && this.anims.exists('gorilla-chest')) {
            boss.play('gorilla-chest', true)
          }

          // Title text — varies by boss type
          let title, subtitle
          if (isFinal) {
            title    = '...ONE MORE.'
            subtitle = '— THE LAST ONE —'
          } else if (isEaster) {
            title    = '?!?!?!'
            subtitle = '— THIS FEELS FAMILIAR —'   // 🦍 DK nod
          } else if (count >= 4) {
            title    = 'BOSS FIGHT'
            subtitle = `— × ${count} ANGRY GORILLAS —`
          } else if (count >= 2) {
            title    = 'BOSS FIGHT'
            subtitle = `— × ${count} ANGRY GORILLAS —`
          } else {
            title    = 'BOSS FIGHT'
            subtitle = '— THE ANGRY GORILLA —'
          }

          const line1 = this.add.text(width / 2, height / 2 - 64, title, {
            fontSize: '56px', fontFamily: 'monospace', color: '#ff8c00',
            stroke: '#000000', strokeThickness: 6,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)

          const line2 = this.add.text(width / 2, height / 2 + 20, subtitle, {
            fontSize: '24px', fontFamily: 'monospace', color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)

          this.tweens.add({ targets: [line1, line2], alpha: 1, duration: 380 })

          this.time.delayedCall(HOLD, () => {
            this.tweens.add({
              targets: [overlay, line1, line2], alpha: 0, duration: 420,
              onComplete: () => {
                overlay.destroy(); line1.destroy(); line2.destroy()
                if (boss.walkAnim && this.anims.exists(boss.walkAnim)) {
                  boss.play(boss.walkAnim, true)
                }
                cam.pan(this.player.x, this.player.y, PAN_BACK, 'Sine.easeInOut')
                cam.zoomTo(1.0, ZOOM_OUT, 'Sine.easeInOut')
                this.time.delayedCall(PAN_BACK, () => {
                  cam.startFollow(this.player, true, 0.18, 0.12)
                  onComplete()
                })
              },
            })
          })
        },
      })
    })
  }

  // Special cinematic between the 4 bosses and the final lone boss (L16)
  showFinalBossCinematic(onComplete) {
    const { width, height } = this.scale
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setScrollFactor(0).setDepth(900)

    this.tweens.add({
      targets: overlay, alpha: 1, duration: 800,
      onComplete: () => {
        const txt = this.add.text(width / 2, height / 2, '...one more.', {
          fontSize: '36px', fontFamily: 'monospace', color: '#ff8c00',
          stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)

        this.tweens.add({
          targets: txt, alpha: 1, duration: 600,
          onComplete: () => {
            this.time.delayedCall(2000, () => {
              this.tweens.add({
                targets: [txt, overlay], alpha: 0, duration: 700,
                onComplete: () => { txt.destroy(); overlay.destroy(); onComplete() },
              })
            })
          },
        })
      },
    })
  }

  // ── COMBAT ────────────────────────────────────────────────────────────────

  _inDepthRange(ay, by, tolerance = 80) {
    return Math.abs(ay - by) <= tolerance
  }

  handlePlayerAttack({ x, y, range, damage }) {
    this.enemies.forEach(enemy => {
      if (!enemy.active) return
      if (!this._inDepthRange(y, enemy.y)) return
      if (Phaser.Math.Distance.Between(x, enemy.y, enemy.x, enemy.y) <= range) {
        enemy.takeHit(damage)
        this.score += 10
        this.events.emit('score-update', this.score)
        this.spawnHitEffect(enemy.x, enemy.y - 60)
      }
    })
  }

  handlePlayerSpecial({ x, y, range, damage }) {
    this.enemies.forEach(enemy => {
      if (!enemy.active) return
      if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= range) {
        enemy.takeHit(damage)
        this.spawnHitEffect(enemy.x, enemy.y - 60)
      }
    })
    this.score += 50
    this.events.emit('score-update', this.score)
  }

  handleEnemyAttack({ enemy, damage }) {
    if (!this.player?.active) return
    if (!this._inDepthRange(enemy.y, this.player.y)) return
    if (Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) <= 144) {
      this.player.takeHit(damage)
    }
  }

  onBossShockwave({ x, y, radius }) {
    if (!this.player?.active) return
    if (!this._inDepthRange(y, this.player.y, 90)) return
    if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) <= radius) {
      this.player.takeHit(25)
    }
  }

  onEnemyDefeated(enemy) {
    this.enemies = this.enemies.filter(e => e !== enemy)
    this.score += 100
    this.events.emit('score-update', this.score)
    const activeEnemies = this.enemies.filter(e => e.active)
    if (activeEnemies.length > 0 || (this.pendingSpawns || 0) > 0) return
    this.advanceWave()
  }

  onBossDefeated() {
    this.time.timeScale = 1
    this.score += 1000
    this.events.emit('score-update', this.score)

    // Track multi-boss count
    this.activeBossCount = Math.max(0, this.activeBossCount - 1)
    if (this.activeBossCount > 0) return   // wait for all bosses to die

    const nextEntry = this.levelData.waves[this.wave]
    this.time.delayedCall(2000, () => {
      if (!nextEntry) {
        this._resumeLevelMusic()
        this.nextLevel()
      } else if (nextEntry.boss && nextEntry.final) {
        // L16 special: cinematic then final solo boss
        this.showFinalBossCinematic(() => {
          if (this.player) { this.player._frozen = true; this.player.body.setVelocity(0, 0) }
          const finalBoss = this.spawnMultipleBosses(1, 1.5)
          this.showBossIntro(finalBoss, () => {
            if (this.player) this.player._frozen = false
          }, { count: 1, isFinal: true })
          this.wave++
        })
      } else {
        this._resumeLevelMusic()
        this.advanceWave()
      }
    })
  }

  spawnHitEffect(x, y) {
    if (!this.anims.exists('hit-spark')) return
    const spark = this.add.sprite(x, y, 'hit-effects', 0)
    spark.setDepth(999).setScale(0.75)
    spark.setBlendMode(Phaser.BlendModes.ADD)
    spark.play('hit-spark')
    spark.once('animationcomplete', () => spark.destroy())
  }

  onPlayerKO() {
    if (this.music) { this.music.destroy(); this.music = null }
    if (this.bossMusic) { this.bossMusic.destroy(); this.bossMusic = null }
    this.lives--
    this.events.emit('lives-update', this.lives)
    this.time.delayedCall(1800, () => {
      this.scene.stop('UI')
      if (this.lives > 0) {
        this.scene.restart({ level: this.levelIndex + 1, score: this.score, lives: this.lives })
      } else {
        this.scene.start('GameOver', { score: this.score })
      }
    })
  }

  nextLevel() {
    if (this.music) { this.music.destroy(); this.music = null }
    if (this.bossMusic) { this.bossMusic.destroy(); this.bossMusic = null }
    if (this.cache.audio.exists('sfx-level-complete')) {
      this.sound.play('sfx-level-complete', { volume: 0.85 })
    }
    const next = this.levelIndex + 1
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UI')

      if (next >= LEVELS.length) {
        this.scene.start('Win', { score: this.score })
        return
      }

      // After zone-end levels (4, 8, 12) → lore scene
      const currentId = this.levelData.id
      if (currentId === 4 || currentId === 8 || currentId === 12) {
        this.scene.start('Lore', {
          afterLevel: currentId,
          nextLevel:  currentId + 1,
          score:      this.score,
          lives:      this.lives,
        })
      } else {
        this.scene.restart({ level: next + 1, score: this.score, lives: this.lives })
      }
    })
  }

  shutdown() {
    if (this.music)     { this.music.destroy();     this.music     = null }
    if (this.bossMusic) { this.bossMusic.destroy();  this.bossMusic = null }
  }

  applyDepthScale(sprite) {
    const range = this.walkBottom - this.walkTop
    const t = Math.max(0, Math.min(1, (sprite.y - this.walkTop) / range))
    const depthScale = 0.55 + t * 0.45
    if (sprite.state !== 'special') {
      sprite.setScale(sprite._baseDisplayScale * depthScale)
    }
    sprite.setDepth(sprite.y)
  }

  update(time, delta) {
    if (!this.player?.active) return
    this.player.update(time, delta)
    this.applyDepthScale(this.player)
    this.enemies.forEach(e => {
      if (e.active) {
        e.update(time, delta)
        this.applyDepthScale(e)
      }
    })
    if (this.awaitingAdvance && this.player.x >= this.worldW - 140) {
      this.awaitingAdvance = false
      this.events.emit('advance-prompt', false)
      this.nextLevel()
    }
  }
}
