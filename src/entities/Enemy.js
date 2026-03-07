export default class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, config = {}) {
    const tex = config.texture || 'macaque-walk'
    super(scene, x, y, tex, 0)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    this.body.setSize(72, 150).setOffset(24, 42)
    // Base scale for GameScene depth system
    this._baseDisplayScale = config.displayScale ?? 1.0

    this.hp       = config.hp     || 40
    this.maxHp    = this.hp
    this.speed    = config.speed  || 120
    this.damage   = config.damage || 8
    this.type     = config.type   || 'macaque'
    this.walkAnim   = config.walkAnim   || 'macaque-walk'
    this.attackAnim = config.attackAnim || 'macaque-attack'
    this.hurtAnim   = config.hurtAnim   || 'macaque-hurt'

    // SoR hit mechanic: 2 hits → knockdown, 2 floor hits → dead
    this._sorMode        = config.sorMode || false
    this._sorStandingHits = 0   // counts up to 2 → knockdown
    this._sorFloorHits    = 0   // counts up to 2 → dead
    this._sorDown         = false

    this.aiState = 'chase'
    this.target  = null
    this.attackCooldown = 0
    this.hurtTimer = 0

    this.on('animationcomplete', (anim) => {
      if (anim.key === this.attackAnim) this.aiState = 'chase'
      if (anim.key === this.hurtAnim && this.aiState !== 'ko') this.aiState = 'chase'
    })

    // Play idle walk immediately
    if (this.walkAnim) this.play(this.walkAnim, true)
  }

  setTarget(player) { this.target = player }

  // Minimum distance we try to keep from other enemies so they don’t stack into one blob
  static get MIN_ENEMY_DISTANCE() { return 56 }
  static get SEPARATION_STRENGTH() { return 90 }

  /** Returns a velocity offset (vx, vy) to nudge this enemy away from others that are too close. */
  getSeparationVector() {
    const list = this.scene && this.scene.enemies
    if (!list || !Array.isArray(list)) return { vx: 0, vy: 0 }
    let vx = 0
    let vy = 0
    const minD = Enemy.MIN_ENEMY_DISTANCE
    const strength = Enemy.SEPARATION_STRENGTH
    for (const other of list) {
      if (!other?.active || other === this || other.aiState === 'ko') continue
      const d = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y)
      if (d <= 0 || d >= minD) continue
      // Push away from other; stronger when closer
      const t = 1 - d / minD
      const angle = Phaser.Math.Angle.Between(other.x, other.y, this.x, this.y)
      vx += Math.cos(angle) * strength * t
      vy += Math.sin(angle) * strength * t
    }
    return { vx, vy }
  }

  update(time, delta) {
    if (this.aiState === 'ko') return
    if (this.scene?._cinemaMode) { this.body.setVelocity(0, 0); return }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta
      this.body.setVelocity(0, 0)
      return
    }
    if (this.attackCooldown > 0) this.attackCooldown -= delta

    if (!this.target) { this.body.setVelocity(0, 0); return }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y)
    // Flip based on own velocity direction — independent logic per character
    if (Math.abs(this.body.velocity.x) > 5) {
      this.setFlipX(this.body.velocity.x < 0)
    }

    // Don't interrupt a mid-swing attack animation
    if (this.aiState === 'attack') return

    // Always chase — no patrol fallback, no lingering off-screen
    if (dist > 130) {
      this.aiState = 'chase'
      this.chaseTarget()
      if (this.walkAnim && this.anims.currentAnim?.key !== this.walkAnim) {
        this.play(this.walkAnim, true)
      }
    } else {
      this.body.setVelocity(0, 0)
      if (this.attackCooldown <= 0) this.doAttack()
    }

    this.setDepth(this.y)
  }

  chaseTarget() {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y)
    let vx = Math.cos(angle) * this.speed
    let vy = Math.sin(angle) * this.speed * 0.6
    // Apply distance rule: nudge away from other enemies
    const sep = this.getSeparationVector()
    vx += sep.vx
    vy += sep.vy
    // Cap total speed so separation doesn’t make movement look erratic
    const total = Math.sqrt(vx * vx + vy * vy)
    const maxSpeed = this.speed * 1.4
    if (total > maxSpeed && total > 0) {
      const f = maxSpeed / total
      vx *= f
      vy *= f
    }
    this.body.setVelocity(vx, vy)
  }

  doAttack() {
    this.attackCooldown = 1400
    this.aiState = 'attack'
    this.body.setVelocity(0, 0)
    if (this.attackAnim) this.play(this.attackAnim)
    this.scene.events.emit('enemy-attack', { enemy: this, damage: this.damage })
    // SFX — boss has its own attack sound, grunts share the enemy one
    const sfxKey = this.type === 'boss' ? 'sfx-boss-attack' : 'sfx-enemy-attack'
    if (this.scene.cache.audio.exists(sfxKey)) this.scene.sound.play(sfxKey, { volume: 0.65 })
  }

  takeHit(damage) {
    if (this.aiState === 'ko') return
    if (this.hurtTimer > 0) return

    // ── SoR hit mechanic ────────────────────────────────────────────────────
    if (this._sorMode) {
      this.hurtTimer = 300
      if (this.scene?.cache.audio.exists('sfx-punch')) {
        this.scene.sound.play('sfx-punch', { volume: 0.3, detune: Phaser.Math.Between(-200, 200) })
      }

      if (!this._sorDown) {
        // Standing phase
        this._sorStandingHits++
        this.setTint(0xff6666)
        this.scene.time.delayedCall(120, () => this.clearTint())

        if (this._sorStandingHits >= 2) {
          // Knockdown
          this._sorDown = true
          this.aiState  = 'ko'
          this.body.setVelocity(0, 0)
          if (this.anims.exists('sor-knockdown')) {
            this.play('sor-knockdown')
            this.once('animationcomplete', () => {
              if (this.active && this.anims.exists('sor-down')) this.play('sor-down')
            })
          }
        } else {
          this.aiState = 'hurt'
          if (this.anims.exists('sor-hurt')) this.play('sor-hurt')
        }
      } else {
        // Floor phase
        this._sorFloorHits++
        this.setTint(0xff4444)
        this.scene.time.delayedCall(120, () => this.clearTint())

        if (this._sorFloorHits >= 2) {
          this._die()
        }
      }
      return
    }
    // ── Standard hit mechanic ────────────────────────────────────────────────
    this.hp -= damage
    this.hurtTimer = 350
    if (this.type === 'boss' && this.scene) this.scene.events.emit('boss-hp-update', { hp: this.hp, maxHp: this.maxHp })

    if (this.hp <= 0) {
      this._die()
    } else {
      this.aiState = 'hurt'
      if (this.hurtAnim && this.anims.exists(this.hurtAnim)) this.play(this.hurtAnim)
      if (this.type !== 'boss' && this.scene.cache.audio.exists('sfx-punch')) {
        this.scene.sound.play('sfx-punch', { volume: 0.3, detune: Phaser.Math.Between(-200, 200) })
      }
      if (this.scene) this.scene.events.emit('enemy-hurt', this)
    }
  }

  _die() {
    this.aiState = 'ko'
    this.body.setVelocity(0, 0)
    this.setTint(0xffffff)
    if (this.type !== 'boss' && this.scene?.cache.audio.exists('sfx-enemy-death')) {
      this.scene.sound.play('sfx-enemy-death', { volume: 0.7 })
    }
    this.scene.time.delayedCall(380, () => {
      if (!this.scene) return
      if (this.type === 'boss') this.scene.events.emit('boss-defeated')
      else this.scene.events.emit('enemy-defeated', this)
      this.destroy()
    })
  }
}
