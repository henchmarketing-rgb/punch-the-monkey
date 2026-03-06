import Enemy from './Enemy.js'

export default class Boss extends Enemy {
  constructor(scene, x, y, opts = {}) {
    const hpMult = opts.hpMultiplier || 1
    super(scene, x, y, {
      texture:    'gorilla-idle',
      walkAnim:   'gorilla-walk',
      attackAnim: 'gorilla-slam',
      hp: Math.round(675 * hpMult),   // 3× base × optional multiplier
      speed:  150,
      damage: 20,
      type:   'boss',
    })

    this.body.setSize(180, 300).setOffset(60, 60)
    // Gorilla is 1.33× the base display scale — imposing over enemies (macaque = 1.0)
    // Walk frame 316×272 @ 1.33 → ~420×362 display. Depth-scaled down at mid-screen.
    this._baseDisplayScale = 1.33
    this.phase = 1
    this.shockwaveTimer = 0
    this.hurtAnim = null  // boss has no hurt anim, just flashes

    // Announce boss spawn for UI
    scene.events.emit('boss-spawn', this)
  }

  update(time, delta) {
    if (this.aiState === 'ko') return

    // Phase transition
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) {
      this.phase = 2
      this.speed += 80
      this.scene.cameras.main.flash(300, 255, 0, 0)
    }

    // Shockwave in phase 2
    if (this.phase === 2) {
      this.shockwaveTimer -= delta
      if (this.shockwaveTimer <= 0) {
        this.doShockwave()
        this.shockwaveTimer = 3000
      }
    }

    super.update(time, delta)
  }

  doShockwave() {
    if (!this.scene) return
    const sw = this.scene.add.sprite(this.x, this.y + 100, 'boss-shockwave', 0)
    sw.setScale(0.65)   // 414×240 frame × 0.65 ≈ 269×156px
    sw.setDepth(this.y - 1)
    sw.play('boss-shockwave')
    sw.once('animationcomplete', () => sw.destroy())
    if (this.scene.cache.audio.exists('sfx-boss-special')) {
      this.scene.sound.play('sfx-boss-special', { volume: 0.75 })
    }
    this.scene.events.emit('boss-shockwave', { x: this.x, y: this.y, radius: 300 })
  }

  takeHit(damage) {
    if (this.aiState === 'ko') return
    this.hp -= damage
    // Flash tint instead of playing hurt anim
    this.setTint(0xff4444)
    this.scene.time.delayedCall(150, () => { if (this.active) this.clearTint() })

    // Update boss HP bar
    if (this.scene) this.scene.events.emit('boss-hp-update', { hp: this.hp, maxHp: this.maxHp })

    if (this.hp <= 0) {
      this.hp = 0
      this.aiState = 'ko'
      this.body.setVelocity(0, 0)
      this.deathSequence()
    }
  }

  deathSequence() {
    const scene = this.scene
    if (!scene) return

    scene.cameras.main.shake(800, 0.02)
    scene.time.timeScale = 0.25
    // Boss death roar
    if (scene.cache.audio.exists('sfx-boss-death')) {
      scene.sound.play('sfx-boss-death', { volume: 0.9 })
    }
    // Stop and destroy boss music
    if (scene.bossMusic) { scene.bossMusic.destroy(); scene.bossMusic = null }

    // Triple white flash
    let flashes = 0
    const doFlash = () => {
      this.setTint(0xffffff)
      scene.time.delayedCall(120, () => {
        if (this.active) this.clearTint()
        flashes++
        if (flashes < 3) scene.time.delayedCall(120, doFlash)
        else {
          scene.time.delayedCall(400, () => {
            // Restore time scale
            scene.time.timeScale = 1
            // Boss FX
            const fx = scene.add.sprite(this.x, this.y, 'boss-fx-fire', 0)
            fx.setDepth(999).setScale(1.0)   // 288px frame × 1.0 = 288px — big but contained
            fx.play('boss-fx-fire')
            fx.once('animationcomplete', () => fx.destroy())
            scene.events.emit('boss-defeated')
            this.destroy()
          })
        }
      })
    }
    scene.time.delayedCall(300, doFlash)
  }
}
