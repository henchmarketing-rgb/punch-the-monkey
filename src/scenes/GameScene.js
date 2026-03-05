import Player from '../entities/Player.js'
import Enemy  from '../entities/Enemy.js'
import Boss   from '../entities/Boss.js'
import { LEVELS } from '../config/levels.js'

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game') }

  init(data) {
    this.levelIndex     = (data.level || 1) - 1
    this.levelData      = LEVELS[this.levelIndex] || LEVELS[0]
    this.score          = data.score || 0
    this.lives          = data.lives !== undefined ? data.lives : 3
    this.wave           = 1
    this.bossSpawned    = false
    this.awaitingAdvance = false   // true after all enemies cleared on non-boss levels
  }

  create() {
    const { width, height } = this.scale
    // World is 30% wider than the canvas (15% extra each side) — subtle side-scroll
    this.worldW = Math.floor(width * 1.30)
    const worldW = this.worldW

    // Background pinned to camera at native resolution — no stretching, no stitching
    // Background image is exactly worldW×height — scrolls naturally with the camera
    const bgKey = this.textures.exists(this.levelData.bg) ? this.levelData.bg : 'bg-zoo-fallback'
    this.bg = this.add.image(0, 0, bgKey).setOrigin(0, 0).setScrollFactor(1)

    // Walk band — top = max "back" (floor level in background art ~45%)
    // Bottom = close to camera. Range ~389px — enough evasion depth without going into sky.
    this.walkTop    = Math.floor(height * 0.42)
    this.walkBottom = Math.floor(height * 0.93)
    const walkH = this.walkBottom - this.walkTop

    // Physics world = walkable strip, fixed screen width
    this.physics.world.setBounds(0, this.walkTop, worldW, walkH)
    this.cameras.main.setBounds(0, 0, worldW, height)

    // Player starts in the left quarter, camera follows with world bounds clamping
    this.player = new Player(this, width * 0.15, height * 0.80)
    this.player.body.setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.player, true, 0.18, 0.12)

    // Enemies
    this.enemies = []
    this.boss    = null
    this.spawnWave()

    // Events (registered once here)
    this.events.on('player-attack',  this.handlePlayerAttack,  this)
    this.events.on('player-special', this.handlePlayerSpecial, this)
    this.events.on('enemy-attack',   this.handleEnemyAttack,   this)
    this.events.on('player-ko',      this.onPlayerKO,          this)
    this.events.on('enemy-defeated', this.onEnemyDefeated,     this)
    this.events.on('boss-defeated',  this.onBossDefeated,      this)
    this.events.on('boss-shockwave', this.onBossShockwave,     this)

    // Music
    const musicKey = this.levelData.musicKey
    if (musicKey && this.cache.audio.exists(musicKey)) {
      // Defensively kill any lingering instances of this track before creating a new one
      this.sound.getAll(musicKey).forEach(s => s.destroy())
      this.music = this.sound.add(musicKey, { loop: true, volume: 0.5 })
      this.music.play()
    }

    // Level transition card
    this.scene.launch('Transition', {
      levelName: this.levelData.name,
      levelNum:  this.levelData.id,
      zone:      this.levelData.zone,
    })

    // UI
    this.scene.launch('UI', { levelData: this.levelData, player: this.player, lives: this.lives })

    // Camera fade in
    this.cameras.main.fadeIn(600, 0, 0, 0)
  }

  spawnWave() {
    const { width, height } = this.scale
    const waveCfg = this.levelData.waves[this.wave - 1]
    if (!waveCfg) return

    const cam = this.cameras.main

    // Track pending delayed spawns — prevents premature wave-clear if early enemies die fast
    this.pendingSpawns = (this.pendingSpawns || 0) + waveCfg.count

    for (let i = 0; i < waveCfg.count; i++) {
      this.time.delayedCall(i * 320, () => {
        if (!this.player?.active) { this.pendingSpawns = Math.max(0, this.pendingSpawns - 1); return }

        // Spawn just off the world edges
        const fromLeft = i % 3 === 2
        const spawnX = fromLeft ? -80 : this.worldW + 80

        const y = Phaser.Math.Between(this.walkTop + 40, this.walkBottom - 30)

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

  // Y-plane check: only characters on a similar depth plane can hit each other.
  // This lets Punch-kun step "back" to dodge attacks — classic belt-scroller mechanic.
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
    // Special ignores depth plane — full AOE
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
    // Boss shockwave has wider depth tolerance (ground slam)
    if (!this._inDepthRange(y, this.player.y, 90)) return
    if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) <= radius) {
      this.player.takeHit(25)
    }
  }

  onEnemyDefeated(enemy) {
    this.enemies = this.enemies.filter(e => e !== enemy)
    this.score += 100
    this.events.emit('score-update', this.score)

    // Wait until ALL enemies are cleared AND no more are still queued to spawn
    const activeEnemies = this.enemies.filter(e => e.active)
    if (activeEnemies.length > 0 || (this.pendingSpawns || 0) > 0) return

    const totalWaves = this.levelData.waves.length
    const hasMoreWaves = this.wave < totalWaves

    if (hasMoreWaves) {
      // Advance to next wave — brief breather then enemies walk in from off-screen
      this.wave++
      this.time.delayedCall(1400, () => this.spawnWave())
    } else if (this.levelData.bossAt && !this.bossSpawned) {
      // All waves cleared — cinematic boss intro
      this.bossSpawned = true
      this.time.delayedCall(700, () => {
        // Freeze player during intro
        if (this.player) {
          this.player._frozen = true
          this.player.body.setVelocity(0, 0)
        }
        const boss = this.spawnBoss()
        this.showBossIntro(boss, () => {
          if (this.player) this.player._frozen = false
        })
      })
    } else {
      // No boss — player must walk to the right edge to advance
      this.time.delayedCall(600, () => {
        this.awaitingAdvance = true
        this.events.emit('advance-prompt', true)
      })
    }
  }

  showBossIntro(boss, onComplete) {
    const { width, height } = this.scale
    const cam = this.cameras.main
    const PAN_TO   = 1400
    const ZOOM_IN  = 1400   // zoom in duration matches the pan
    const HOLD     = 2600   // hold on the boss before text fades
    const PAN_BACK = 1300
    const ZOOM_OUT = 1300   // zoom back to normal alongside pan back

    // Swap to boss music immediately (don't play yet — plays after cinematic)
    if (this.music) { this.music.destroy(); this.music = null }
    if (this.cache.audio.exists('music-boss')) {
      this.bossMusic = this.sound.add('music-boss', { loop: true, volume: 0.55 })
    }

    // Roar plays immediately as camera starts flying
    if (this.cache.audio.exists('sfx-boss-intro')) {
      this.sound.play('sfx-boss-intro', { volume: 0.85 })
    }

    // Stop follow so we can pan freely
    cam.stopFollow()

    // Phase 1 — camera flies to the gorilla AND zooms in simultaneously
    cam.pan(boss.x, boss.y, PAN_TO, 'Sine.easeInOut')
    cam.zoomTo(2.0, ZOOM_IN, 'Sine.easeInOut')

    this.time.delayedCall(PAN_TO, () => {
      // Phase 2 — dark vignette drops over the scene, boss fully lit in centre
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
        .setScrollFactor(0).setDepth(900)

      this.tweens.add({
        targets: overlay, alpha: 0.78, duration: 350,
        onComplete: () => {
          // Heavy screen shake — gorilla pounds the ground
          cam.shake(800, 0.025)

          // If chest-beat animation exists, play it now (drops in automatically once sprite is added)
          if (boss.anims && this.anims.exists('gorilla-chest')) {
            boss.play('gorilla-chest', true)
          }

          // Title cards
          const line1 = this.add.text(width / 2, height / 2 - 64, 'BOSS FIGHT', {
            fontSize: '56px', fontFamily: 'monospace', color: '#ff8c00',
            stroke: '#000000', strokeThickness: 6,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)

          const line2 = this.add.text(width / 2, height / 2 + 20, '— THE ANGRY GORILLA —', {
            fontSize: '24px', fontFamily: 'monospace', color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)

          this.tweens.add({ targets: [line1, line2], alpha: 1, duration: 380 })

          // Phase 3 — hold on boss, then fade out overlay + titles
          this.time.delayedCall(HOLD, () => {
            this.tweens.add({
              targets: [overlay, line1, line2], alpha: 0, duration: 420,
              onComplete: () => {
                overlay.destroy(); line1.destroy(); line2.destroy()

                // Restore walk anim if chest-beat was playing
                if (boss.walkAnim && this.anims.exists(boss.walkAnim)) {
                  boss.play(boss.walkAnim, true)
                }

                // Phase 4 — zoom out + pan back to player simultaneously
                cam.pan(this.player.x, this.player.y, PAN_BACK, 'Sine.easeInOut')
                cam.zoomTo(1.0, ZOOM_OUT, 'Sine.easeInOut')

                this.time.delayedCall(PAN_BACK, () => {
                  cam.startFollow(this.player, true, 0.18, 0.12)
                  if (this.bossMusic) this.bossMusic.play()
                  onComplete()
                })
              },
            })
          })
        },
      })
    })
  }

  spawnBoss() {
    const { height } = this.scale
    const cam = this.cameras.main
    const spawnX = Math.min(cam.scrollX + cam.width + 80, this.worldW - 30)
    const spawnY = Phaser.Math.Between(this.walkTop + 60, this.walkBottom - 40)
    this.boss = new Boss(this, spawnX, spawnY)
    this.boss.setTarget(this.player)
    this.boss.body.setCollideWorldBounds(true)
    this.enemies.push(this.boss)
    return this.boss
  }

  onBossDefeated() {
    this.time.timeScale = 1
    this.score += 1000
    this.events.emit('score-update', this.score)
    this.time.delayedCall(2000, () => this.nextLevel())
  }

  spawnHitEffect(x, y) {
    if (!this.anims.exists('hit-spark')) return
    const spark = this.add.sprite(x, y, 'hit-effects', 0)
    spark.setDepth(999).setScale(0.75)   // 144px frame × 0.75 = 108px — proportional to 192px player
    spark.setBlendMode(Phaser.BlendModes.ADD)  // additive blend — no box, pure glow
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
        // Respawn — restart same level, keep score + remaining lives
        this.scene.restart({ level: this.levelIndex + 1, score: this.score, lives: this.lives })
      } else {
        this.scene.start('GameOver', { score: this.score })
      }
    })
  }

  nextLevel() {
    if (this.music) { this.music.destroy(); this.music = null }
    if (this.bossMusic) { this.bossMusic.destroy(); this.bossMusic = null }
    // Play level-complete sting
    if (this.cache.audio.exists('sfx-level-complete')) {
      this.sound.play('sfx-level-complete', { volume: 0.85 })
    }
    const next = this.levelIndex + 1
    this.cameras.main.fadeOut(600, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('UI')
      if (next >= LEVELS.length) {
        this.scene.start('Win', { score: this.score })
      } else {
        this.scene.restart({ level: next + 1, score: this.score, lives: this.lives })
      }
    })
  }

  // Called by Phaser when scene is stopped or restarted — destroy managed sounds
  shutdown() {
    if (this.music)     { this.music.destroy();     this.music     = null }
    if (this.bossMusic) { this.bossMusic.destroy();  this.bossMusic = null }
  }

  // Depth scale: characters further back (lower Y) appear smaller.
  // At walkTop  (far back)   → scale multiplier 0.55  (clearly small/distant)
  // At walkBottom (up front) → scale multiplier 1.00  (full size)
  applyDepthScale(sprite) {
    const range = this.walkBottom - this.walkTop
    const t = Math.max(0, Math.min(1, (sprite.y - this.walkTop) / range))
    const depthScale = 0.55 + t * 0.45
    // During 'special' the frame is taller — use the sprite's own current base scale
    // instead of overriding it (Player._applyScale sets the right scale for special frames)
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

    // Walk-to-advance: player must reach right edge after all enemies cleared
    if (this.awaitingAdvance && this.player.x >= this.worldW - 140) {
      this.awaitingAdvance = false
      this.events.emit('advance-prompt', false)
      this.nextLevel()
    }
  }
}
