// Normalise all Punch-kun animations to this display height in pixels.
// Every texture/anim switch must call this._applyScale() to keep it consistent.
const PLAYER_DISPLAY_H = 192   // target visual height at 1440×810 canvas

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'punch-idle')
    scene.add.existing(this)
    scene.physics.add.existing(this)

    this.body.setSize(84, 180).setOffset(30, 54)
    this.body.setDragX(0).setDragY(0)   // no drift — velocity must be zeroed explicitly
    this.body.setMaxVelocity(400, 400)
    this.setDepth(10)

    // Pin the display height so idle (162×240) and walk (174×240) etc.
    // all appear the same visual size regardless of frame dimensions.
    this._idleNaturalH  = 240   // height of punch-idle source image
    this._walkNaturalH  = 240   // frameHeight of walk/attack/kick/hurt sheets
    this._specNaturalH  = 475   // frameHeight of special sheet (taller canvas)
    this._applyScale('normal')
    // Base scale used by GameScene's depth-scaling system
    this._baseDisplayScale = PLAYER_DISPLAY_H / this._walkNaturalH

    // Stats
    // 15 hits to die at typical enemy damage (~8): 8 × 15 = 120 → use 150 for safety margin
    this.hp = 150; this.maxHp = 150
    this.speed = 270; this.attackDmg = 15; this.lives = 3
    this._regenTimer = 0        // ms since last hit before regen kicks in
    this._regenDelay = 3000     // 3s of no hits before regen starts
    this._regenRate  = 8        // HP per second restored (4× faster, visibly climbs)

    // State
    this.state = 'idle'
    this.facingRight = true
    this.isAttacking = false
    this.attackCooldown = 0
    this.hurtTimer = 0
    this.specialCooldown = 0

    // Cinematic freeze — set true during boss intro to lock all input
    this._frozen = false

    // Touch controls (set by UIScene)
    this.touchKeys = { left: false, right: false, up: false, down: false, punch: false, kick: false, special: false }
    this._prevTouch = { punch: false, kick: false, special: false }

    // Keyboard
    this.keys = scene.input.keyboard.addKeys({
      left:    Phaser.Input.Keyboard.KeyCodes.LEFT,
      right:   Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:      Phaser.Input.Keyboard.KeyCodes.UP,
      down:    Phaser.Input.Keyboard.KeyCodes.DOWN,
      punch:   Phaser.Input.Keyboard.KeyCodes.Z,
      kick:    Phaser.Input.Keyboard.KeyCodes.X,
      special: Phaser.Input.Keyboard.KeyCodes.A,
    })

    this.on('animationcomplete', (anim) => {
      if (['punch-attack','punch-kick','punch-hurt','punch-special'].includes(anim.key)) {
        this.isAttacking = false
        this.state = 'idle'
        this.setTexture('punch-idle')
        this._applyScale('normal')
      }
    })
  }

  update(time, delta) {
    if (this.state === 'ko') return

    // Frozen during boss intro cinematic
    if (this._frozen) {
      this.body.setVelocity(0, 0)
      if (this.state !== 'idle') {
        this.state = 'idle'
        this.setTexture('punch-idle')
        this.stop()
        this._applyScale('normal')
      }
      return
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta
    if (this.specialCooldown > 0) this.specialCooldown -= delta

    // HP regen — kicks in after 3s of no damage, restores 2 HP/sec up to max
    if (this.hp < this.maxHp && this.hp > 0) {
      this._regenTimer += delta
      if (this._regenTimer >= this._regenDelay) {
        const gain = (this._regenRate * delta) / 1000
        this.hp = Math.min(this.maxHp, this.hp + gain)
        this.scene.events.emit('player-regen', this.hp)
      }
    }

    if (this.hurtTimer > 0) {
      this.hurtTimer -= delta
      return
    }

    const k = this.keys
    const t = this.touchKeys
    const prev = this._prevTouch

    const movingLeft  = k.left.isDown  || t.left
    const movingRight = k.right.isDown || t.right
    const movingUp    = k.up.isDown    || t.up
    const movingDown  = k.down.isDown  || t.down
    const isMoving    = movingLeft || movingRight || movingUp || movingDown

    if (movingLeft)       { this.body.setVelocityX(-this.speed); this.facingRight = false }
    else if (movingRight) { this.body.setVelocityX(this.speed);  this.facingRight = true  }
    else                  this.body.setVelocityX(0)

    if (movingUp)         this.body.setVelocityY(-this.speed * 0.75)
    else if (movingDown)  this.body.setVelocityY(this.speed * 0.75)
    else                  this.body.setVelocityY(0)

    this.setFlipX(!this.facingRight)

    // Touch "just pressed" detection
    const specialJust  = t.special && !prev.special
    const punchJust    = t.punch   && !prev.punch
    const kickJust     = t.kick    && !prev.kick

    if ((Phaser.Input.Keyboard.JustDown(k.special) || specialJust) && this.specialCooldown <= 0) {
      this.doSpecial()
    } else if ((Phaser.Input.Keyboard.JustDown(k.punch) || punchJust) && this.attackCooldown <= 0 && !this.isAttacking) {
      this.doAttack('punch')
    } else if ((Phaser.Input.Keyboard.JustDown(k.kick)  || kickJust)  && this.attackCooldown <= 0 && !this.isAttacking) {
      this.doAttack('kick')
    } else if (!this.isAttacking) {
      if (isMoving && this.state !== 'walk') {
        this.state = 'walk'
        this.play('punch-walk')
        this._applyScale('normal')
      } else if (!isMoving && this.state !== 'idle') {
        this.state = 'idle'
        this.setTexture('punch-idle')
        this.stop()
        this._applyScale('normal')
      }
    }

    // Store prev touch state for JustDown detection
    prev.punch   = t.punch
    prev.kick    = t.kick
    prev.special = t.special

    // Depth is managed by GameScene.applyDepthScale()
  }

  doAttack(type) {
    this.isAttacking = true
    this.state = type
    this.attackCooldown = type === 'punch' ? 420 : 580
    this.body.setVelocity(0, 0)
    this.play(type === 'punch' ? 'punch-attack' : 'punch-kick')
    this._applyScale('normal')
    // SFX
    const sfxKey = type === 'punch' ? 'sfx-punch' : 'sfx-kick'
    if (this.scene.cache.audio.exists(sfxKey)) this.scene.sound.play(sfxKey, { volume: 0.7 })

    const range  = type === 'kick' ? 165 : 132
    const damage = type === 'kick' ? Math.floor(this.attackDmg * 1.5) : this.attackDmg
    this.scene.events.emit('player-attack', {
      x: this.x + (this.facingRight ? range * 0.8 : -range * 0.8),
      y: this.y, range, damage, type
    })
  }

  doSpecial() {
    this.isAttacking = true
    this.state = 'special'
    this.specialCooldown = 5000
    this.body.setVelocity(0, 0)
    this.play('punch-special')
    this._applyScale('special')
    // SFX
    if (this.scene.cache.audio.exists('sfx-special')) this.scene.sound.play('sfx-special', { volume: 0.8 })

    this.scene.events.emit('player-special', { x: this.x, y: this.y, range: 360, damage: this.attackDmg * 3 })

    // Special move no longer costs HP — was silently eating health
  }

  // Keep visual height locked at PLAYER_DISPLAY_H regardless of source frame size.
  // mode='special' uses the taller special-sheet natural height.
  _applyScale(mode = 'normal') {
    const naturalH = mode === 'special' ? this._specNaturalH : this._walkNaturalH
    const s = PLAYER_DISPLAY_H / naturalH
    // Preserve flip direction — scaleX sign handles mirroring via setFlipX
    this.setScale(s)
  }

  _resetRegen() { this._regenTimer = 0 }

  takeHit(damage) {
    if (this.state === 'ko') return
    // I-frames: while hurtTimer is active, player is invincible
    if (this.hurtTimer > 0) return
    this._resetRegen()
    this.hp -= damage
    this.hurtTimer = 600   // 600ms i-frames — survives multi-enemy pileups cleanly
    this.body.setVelocity(0, 0)   // stop dead on hit — no uncontrolled sliding during i-frames

    if (this.hp <= 0) {
      this.hp = 0
      this.state = 'ko'
      if (this.scene.cache.audio.exists('sfx-player-death')) this.scene.sound.play('sfx-player-death', { volume: 0.9 })
      this.scene.events.emit('player-ko')
    } else {
      this.state = 'hurt'
      this.isAttacking = false
      this.play('punch-hurt')
      this._applyScale('normal')
      this.scene.events.emit('player-hurt', this.hp)
    }
  }
}
