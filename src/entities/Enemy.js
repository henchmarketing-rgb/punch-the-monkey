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

  update(time, delta) {
    if (this.aiState === 'ko') return

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta
      this.body.setVelocity(0, 0)
      return
    }
    if (this.attackCooldown > 0) this.attackCooldown -= delta

    if (!this.target) { this.body.setVelocity(0, 0); return }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y)
    this.setFlipX(this.target.x < this.x)

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
    this.body.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed * 0.6)
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
      if (this.scene) this.scene.events.emit('enemy-defeated', this)
      this.destroy()
    })
  }
}
