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
    this.wave                    = 0      // advanceWave() increments before reading
    this.activeBossCount         = 0      // tracks simultaneous bosses alive
    this.awaitingAdvance         = false
    this._bossSpawning           = false  // locked once boss wave is reached — prevents wave counter corruption
    this._bananaSpawnedThisWave  = false
    this.pendingSpawns           = 0
    this._cinemaMode             = false
    this._waveKillCount          = 0   // counts down enemies remaining in current wave
    this._advancingWave          = false  // guard: prevents double-advance between waves
  }

  create() {
    // Hard-kill any music still alive from the previous level before doing anything else
    this.sound.getAll().forEach(s => {
      if (s.key?.startsWith('music-')) { try { s.stop(); s.destroy() } catch(e) {} }
    })

    const { width, height } = this.scale
    this.worldW = Math.floor(width * 1.30)
    const worldW = this.worldW

    // Same as L2: single image, scrollFactor 1 — camera scroll in update() moves view so bg scrolls
    const bgKey = this.textures.exists(this.levelData.bg) ? this.levelData.bg : 'bg-zoo'
    this.bg = this.add.image(0, 0, bgKey)
      .setOrigin(0, 0)
      .setDisplaySize(this.worldW, height)
      .setScrollFactor(1)
      .setDepth(0)

    const topRatio  = this.levelData.walkTopRatio    ?? 0.42
    const botRatio  = this.levelData.walkBottomRatio ?? 0.93
    this.walkTop    = Math.floor(height * topRatio)
    this.walkBottom = Math.floor(height * botRatio)
    const walkH = this.walkBottom - this.walkTop

    // X bounds intentionally large — player constrained by camera, not physics wall
    this.physics.world.setBounds(0, this.walkTop, worldW * 10, walkH)
    this.cameras.main.setBounds(0, 0, worldW, height)

    this.player = new Player(this, width * 0.15, height * 0.80)
    this.player.body.setCollideWorldBounds(true)
    // Belt-scroller: camera only advances RIGHT — never scrolls back left (same for all levels including L1/L2)
    this.cameras.main.stopFollow()
    this._camTargetX = 0

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

  _stopAllMusic() {
    // Kill every currently playing music track — prevents doubling across level transitions
    this.sound.getAll().forEach(s => {
      if (s.key && s.key.startsWith('music-')) {
        try { s.stop(); s.destroy() } catch (e) {}
      }
    })
    this.music     = null
    this.bossMusic = null
  }

  _startLevelMusic() {
    this._stopAllMusic()

    // City zone: city tracks only. All other zones: round-robin through non-city pool.
    // Boss tracks (music-boss, music-boss-final) are excluded — _startBossMusic() only.
    const CITY_POOL     = ['music-city1', 'music-city2']
    // Intro/lore music (music-title) only in Title and Lore — never in level gameplay
    const NON_CITY_POOL = ['music-level1','music-level2','music-forest1','music-forest2','music-credits']

    const isCity = this.levelData.zone === 'escape'
    const pool   = isCity
      ? CITY_POOL
      : NON_CITY_POOL.filter(k => this.cache.audio.exists(k))

    if (!pool.length) return

    // Registry keys keep index alive across scene restarts
    const idxKey = isCity ? 'musicIdx_city' : 'musicIdx_main'
    if (this.game.registry.get(idxKey) == null) this.game.registry.set(idxKey, 0)

    const playNext = () => {
      let idx = this.game.registry.get(idxKey) % pool.length
      const key = pool[idx]
      this.game.registry.set(idxKey, idx + 1)

      if (!this.cache.audio.exists(key)) {
        // Track not cached yet — skip to next
        this.game.registry.set(idxKey, idx + 1)
        playNext()
        return
      }

      this.music = this.sound.add(key, { volume: 0 })
      this.music.play()
      this.tweens.add({ targets: this.music, volume: 0.5, duration: 800 })
      // When track ends naturally, advance to next in cycle
      this.music.once('complete', () => {
        if (this.music) { try { this.music.destroy() } catch(e){} this.music = null }
        playNext()
      })
    }

    // If city track not cached yet (level-nav jump) — load on demand then start
    const cityKey = this.levelData.musicKey
    if (isCity && cityKey && !this.cache.audio.exists(cityKey)) {
      this.load.audio(cityKey, `assets/audio/${cityKey}.mp3`)
      this.load.once('complete', () => playNext())
      this.load.start()
    } else {
      playNext()
    }
  }

  _startBossMusic() {
    if (!this.cache.audio.exists('music-boss')) return
    if (this.music) {
      const fading = this.music
      this.music = null
      this.tweens.add({
        targets: fading, volume: 0, duration: 600,
        onComplete: () => { try { fading.stop(); fading.destroy() } catch(e) {} },
      })
    }
    if (!this.cache.audio.exists('music-boss')) return
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
    this._waveKillCount = waveCfg.count   // must receive exactly this many deaths before advancing
    this.pendingSpawns = (this.pendingSpawns || 0) + waveCfg.count

    // Spawn in simultaneous pairs — one from left, one from right at the same time
    const pairs = Math.ceil(waveCfg.count / 2)
    for (let p = 0; p < pairs; p++) {
      const spawnCount = (p === pairs - 1 && waveCfg.count % 2 === 1) ? 1 : 2
      this.time.delayedCall(p * 400, () => {
        for (let s = 0; s < spawnCount; s++) {
          if (!this.player?.active) { this.pendingSpawns = Math.max(0, this.pendingSpawns - 1); continue }

          const fromLeft = s === 0  // first of pair from left, second from right
          const fromTop  = Phaser.Math.Between(0, 1) === 0
          const cam      = this.cameras.main
          const spawnX   = fromLeft
            ? cam.scrollX - 80
            : cam.scrollX + cam.width + 80
          const y        = fromTop
            ? Phaser.Math.Between(this.walkTop + 20,  this.walkTop  + 80)
            : Phaser.Math.Between(this.walkBottom - 80, this.walkBottom - 20)

          const isSoR = this.levelData.enemyType === 'sor'
          const e = new Enemy(this, spawnX, y, {
            texture:      isSoR ? 'sor-enemy'   : 'macaque-walk',
            walkAnim:     isSoR ? 'sor-walk'    : 'macaque-walk',
            attackAnim:   isSoR ? 'sor-attack'  : 'macaque-attack',
            hurtAnim:     isSoR ? 'sor-hurt'    : 'macaque-hurt',
            sorMode:      isSoR,
            displayScale: isSoR ? 2.5 : 1.0,
            hp:     waveCfg.hp,
            speed:  waveCfg.speed,
            damage: waveCfg.damage,
          })
          e.setTarget(this.player)
          e.body.setCollideWorldBounds(true)
          this.enemies.push(e)
          this.pendingSpawns = Math.max(0, this.pendingSpawns - 1)
        }
      })
    }
  }

  _makeSorBoss(type, x, y, hpMultiplier) {
    const configs = {
      zamza:      { texture: 'sor-boss-zamza', walkAnim: 'zamza-walk',      attackAnim: 'zamza-attack',      hurtAnim: 'zamza-hurt',      speed: 155, displayScale: 2.8 },
      jack:       { texture: 'sor-boss-jack',  walkAnim: 'jack-walk',       attackAnim: 'jack-attack',       hurtAnim: 'jack-hurt',       speed: 140, displayScale: 2.5 },
      electra:    { texture: 'sor-boss-electra',walkAnim:'electra-walk',    attackAnim:'electra-attack',     hurtAnim:'electra-hurt',     speed: 148 },
      zookeeper:     { texture: 'zookeeper',      walkAnim: 'zookeeper-walk',     attackAnim: 'zookeeper-attack',     hurtAnim: 'zookeeper-hurt',     speed: 145, displayScale: 0.52 },
      animalcontrol: { texture: 'animal-control', walkAnim: 'animalcontrol-walk', attackAnim: 'animalcontrol-attack', hurtAnim: 'animalcontrol-hurt', speed: 138, displayScale: 0.75 },
    }
    const cfg = configs[type]
    if (!cfg || !this.textures.exists(cfg.texture)) return null
    return new Enemy(this, x, y, {
      ...cfg, hp: Math.round(675 * hpMultiplier), damage: 20, type: 'boss',
      displayScale: cfg.displayScale ?? 1.6,  // use boss-specific scale, fallback to 1.6
    })
  }

  spawnBoss(offsetX = 0, hpMultiplier = 1, sorBossType = null, fromLeft = false, spawnCentral = false) {
    const cam    = this.cameras.main
    const spawnY = Phaser.Math.Between(this.walkTop + 60, this.walkBottom - 40)
    const spawnX = spawnCentral
      ? cam.scrollX + cam.width / 2
      : fromLeft
        ? Math.max(cam.scrollX - 80 - offsetX, 30)
        : Math.min(cam.scrollX + cam.width + 80 + offsetX, this.worldW - 30)

    let boss = sorBossType ? this._makeSorBoss(sorBossType, spawnX, spawnY, hpMultiplier) : null
    if (!boss) boss = new Boss(this, spawnX, spawnY, { hpMultiplier })
    else this.events.emit('boss-spawn', boss)

    boss.setTarget(this.player)
    boss.body.setCollideWorldBounds(true)
    this.enemies.push(boss)
    return boss
  }

  spawnMultipleBosses(count, hpMultiplier = 1, sorBossType = null) {
    // 'jack+zamza' = paired dual boss, one from each side
    if (sorBossType === 'jack+zamza') {
      this.activeBossCount = 2
      const jack  = this.spawnBoss(0,   hpMultiplier, 'jack',  false)  // right
      const zamza = this.spawnBoss(0,   hpMultiplier, 'zamza', true)   // left
      this.boss = jack
      return jack
    }
    this.activeBossCount = count
    const bosses = []
    const central = count === 1
    for (let i = 0; i < count; i++) {
      bosses.push(this.spawnBoss(i * 220, hpMultiplier, sorBossType, false, central))
    }
    this.boss = bosses[0]
    return bosses[0]
  }

  // ── WAVE RUNNER ───────────────────────────────────────────────────────────

  advanceWave() {
    if (this._bossSpawning) return   // boss wave locked — ignore stray enemy-defeated calls
    if (this._advancingWave) return  // already mid-advance — ignore stray enemy-defeated calls
    this._advancingWave = true
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
      // Lock immediately — advance only after last character has done their last action (removed from list)
      this._advancingWave = false  // bossSpawning takes over from here
      this._bossSpawning = true
      const MAX_BOSS_RETRIES = 150  // ~30s max wait so we never hang forever
      let retries = 0
      const tryBossSequence = () => {
        this.enemies = this.enemies.filter(e => e && e.active)
        const fieldClear = this.enemies.length === 0 && (this.pendingSpawns || 0) === 0
        if (fieldClear || retries >= MAX_BOSS_RETRIES) {
          runBossSequence()
        } else {
          retries++
          this.time.delayedCall(200, tryBossSequence)
        }
      }
      tryBossSequence()
      const runBossSequence = () => {
        const count    = entry.count || 1
        const isFinal  = entry.final  || false
        const isEaster = entry.easter || false
        const sorBoss  = entry.sorBoss || null
        const opts    = { count, isEaster, isFinal, sorBoss }
        // 1) Title card first (no boss on screen), then 2) spawn boss and run zoom intro
        this.showBossTitleCard(opts, () => {
          const hpMult = isFinal ? 1.5 : 1
          const boss  = this.spawnMultipleBosses(count, hpMult, sorBoss)
          this.showBossIntro(boss, () => {
            if (this.player) this.player._frozen = false
          }, opts)
        })
      }
    } else {
      this.time.delayedCall(1400, () => {
        this._advancingWave = false  // unlock — next wave starting, deaths can advance again
        this.spawnWave(entry)
      })
    }
  }

  // ── BOSS INTRO CINEMATIC ──────────────────────────────────────────────────

  /** Picks title/subtitle strings from opts (same logic as showBossIntro). */
  _getBossTitleStrings(opts = {}) {
    const { count = 1, isEaster = false, isFinal = false, sorBoss = null } = opts
    if (isFinal) return { title: '...ONE MORE.', subtitle: '— THE LAST ONE —' }
    if (isEaster) return { title: '?!?!?!', subtitle: '— THIS FEELS FAMILIAR —' }
    if (sorBoss === 'animalcontrol') return { title: 'ANIMAL CONTROL', subtitle: '— NET INCOMING —' }
    if (sorBoss === 'zookeeper') return { title: 'THE ZOOKEEPER', subtitle: '— PUT IT BACK IN THE CAGE —' }
    if (sorBoss === 'zamza') return { title: 'ZAMZA', subtitle: '— THE CLAWS —' }
    if (sorBoss === 'jack') return { title: 'JACK', subtitle: '— THE KNIFE —' }
    if (sorBoss === 'electra') return { title: 'ELECTRA', subtitle: '— STREETS OF RAGE —' }
    if (sorBoss === 'jack+zamza') return { title: 'JACK  &  ZAMZA', subtitle: '— TOGETHER —' }
    if (count >= 2) return { title: 'BOSS FIGHT', subtitle: `— × ${count} ANGRY GORILLAS —` }
    return { title: 'BOSS FIGHT', subtitle: '— THE ANGRY GORILLA —' }
  }

  /** Shows "Boss Fight - The Angry Gorilla" (or variant) on screen first — no boss spawned yet. */
  showBossTitleCard(opts, onComplete) {
    this._cinemaMode = true
    if (this.player) { this.player._frozen = true; this.player.body.setVelocity(0, 0) }

    this._startBossMusic()
    if (this.cache.audio.exists('sfx-boss-intro')) {
      this.sound.play('sfx-boss-intro', { volume: 0.85 })
    }

    const { width, height } = this.scale
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setScrollFactor(0).setDepth(900)
    this.tweens.add({ targets: overlay, alpha: 0.82, duration: 400 })

    const { title, subtitle } = this._getBossTitleStrings(opts)
    const cx = width / 2
    const line1 = this.add.text(cx, height / 2 - 50, title, {
      fontSize: '48px', fontFamily: 'monospace', color: '#ff8c00',
      stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)
    const line2 = this.add.text(cx, height / 2 + 10, subtitle, {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(901).setAlpha(0)
    this.tweens.add({ targets: line1, alpha: 1, duration: 350, delay: 350 })
    this.tweens.add({ targets: line2, alpha: 1, duration: 350, delay: 450 })

    const HOLD = 2600
    this.time.delayedCall(HOLD, () => {
      this.tweens.add({
        targets: [overlay, line1, line2], alpha: 0, duration: 450,
        onComplete: () => {
          overlay.destroy()
          line1.destroy()
          line2.destroy()
          this._cinemaMode = false
          if (onComplete) onComplete()
        },
      })
    })
  }

  showBossIntro(boss, onComplete, opts = {}) {
    if (!boss || !boss.scene) {
      if (onComplete) onComplete()
      return
    }
    this._cinemaMode = true
    const { width, height } = this.scale
    const cam = this.cameras.main
    const { count = 1, isEaster = false, isFinal = false, sorBoss = null } = opts

    const PAN_TO   = 1400
    const ZOOM_IN  = 1400
    const HOLD     = 2600
    const PAN_BACK = 1300
    const ZOOM_OUT = 1300

    // Freeze boss in place for the whole intro so he doesn’t jitter (physics/gravity)
    const wasBossMoving = boss.body ? boss.body.moves : true
    if (boss.body) { boss.body.moves = false; boss.body.setVelocity(0, 0) }
    this._startBossMusic()

    if (this.cache.audio.exists('sfx-boss-intro')) {
      this.sound.play('sfx-boss-intro', { volume: 0.85 })
    }

    // Spawn ONE banana per boss encounter — regardless of how many bosses spawn
    if (!this._bananaSpawnedThisWave) {
      this._bananaSpawnedThisWave = true
      this._spawnBanana(boss.x - 120, boss.y)
    }

    cam.stopFollow()
    // For 2× zoom the visible world size is width/2 × height/2 — center that on the boss
    const zoom = 2.0
    const visW = width / zoom
    const visH = height / zoom
    const maxScrollX = Math.max(0, this.worldW - visW)
    const maxScrollY = Math.max(0, height - visH)
    cam.scrollX = Phaser.Math.Clamp(boss.x - visW / 2, 0, maxScrollX)
    cam.scrollY = Phaser.Math.Clamp(boss.y - visH / 2, 0, maxScrollY)
    cam.zoomTo(zoom, ZOOM_IN, 'Sine.easeInOut')

    this.time.delayedCall(PAN_TO, () => {
      if (!boss || !boss.active) {
        this._cinemaMode = false
        if (this.player) this.player._frozen = false
        onComplete()
        return
      }
      const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
        .setScrollFactor(0).setDepth(900)

      this.tweens.add({
        targets: overlay, alpha: 0.78, duration: 350,
        onComplete: () => {
          if (!boss || !boss.active) {
            overlay.destroy()
            this._cinemaMode = false
            if (this.player) this.player._frozen = false
            onComplete()
            return
          }
          cam.shake(800, 0.025)
          if (boss.anims && this.anims.exists('gorilla-chest')) {
            boss.play('gorilla-chest', true)
          }

          const { title, subtitle } = this._getBossTitleStrings(opts)
          // World-space: positioned above boss, follows boss.x each frame
          const titleY    = boss.y - 160
          const subtitleY = boss.y - 90

          const line1 = this.add.text(boss.x, titleY, title, {
            fontSize: '48px', fontFamily: 'monospace', color: '#ff8c00',
            stroke: '#000000', strokeThickness: 6,
          }).setOrigin(0.5).setDepth(901).setAlpha(0)

          const line2 = this.add.text(boss.x, subtitleY, subtitle, {
            fontSize: '20px', fontFamily: 'monospace', color: '#ffffff',
            stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5).setDepth(901).setAlpha(0)

          // Fly upward slightly as they fade in
          this.tweens.add({ targets: line1, alpha: 1, y: titleY - 12, duration: 380, ease: 'Back.easeOut' })
          this.tweens.add({ targets: line2, alpha: 1, y: subtitleY - 8, duration: 420, ease: 'Back.easeOut' })

          // Keep title/subtitle anchored to boss (same offset as after the fly-up tween)
          const followEvent = this.time.addEvent({
            delay: 16, loop: true,
            callback: () => {
              if (!boss.active) return
              line1.x = boss.x
              line2.x = boss.x
              line1.y = boss.y - 172
              line2.y = boss.y - 98
            },
          })

          this.time.delayedCall(HOLD, () => {
            followEvent.remove()
            this.tweens.add({
              targets: [overlay, line1, line2], alpha: 0, duration: 420,
              onComplete: () => {
                overlay.destroy(); line1.destroy(); line2.destroy()
                if (boss && boss.active && boss.walkAnim && this.anims.exists(boss.walkAnim)) {
                  boss.play(boss.walkAnim, true)
                }
                const px = this.player?.active ? this.player.x : cam.scrollX + cam.width / 2
                const py = this.player?.active ? this.player.y : cam.scrollY + cam.height / 2
                cam.pan(px, py, PAN_BACK, 'Sine.easeInOut')
                cam.zoomTo(1.0, ZOOM_OUT, 'Sine.easeInOut')
                this.time.delayedCall(PAN_BACK, () => {
                  cam.stopFollow()
                  this._cinemaMode = false
                  if (boss && boss.body) boss.body.moves = wasBossMoving
                  onComplete()
                })
              },
            })
          })
        },
      })
    })
  }

  _spawnBanana(x, y) {
    if (!this.textures.exists('banana')) return
    const clampedX = Phaser.Math.Clamp(x, 60, this.worldW - 60)
    const clampedY = Phaser.Math.Clamp(y, this.walkTop + 30, this.walkBottom - 20)

    const banana = this.add.image(clampedX, clampedY, 'banana')
      .setDepth(clampedY + 1)
      .setScale(0.55)   // 96px × 0.55 ≈ 53px on screen — visible but not huge

    // Gentle bob
    this.tweens.add({
      targets: banana, y: clampedY - 10,
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // Golden glow pulse
    this.tweens.add({
      targets: banana, alpha: 0.75,
      duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // Pickup zone — check proximity each frame
    const pickupZone = this.time.addEvent({
      delay: 80, loop: true,
      callback: () => {
        if (!banana.active || !this.player?.active) return
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, banana.x, banana.y)
        if (dist < 70) {
          banana.destroy()
          pickupZone.remove()
          this._collectBanana()
        }
      },
    })

    // Store ref so we can clean up on scene shutdown
    this._bananaPickups = this._bananaPickups || []
    this._bananaPickups.push({ banana, pickupZone })
  }

  _collectBanana() {
    this.lives++
    this.events.emit('lives-update', this.lives)

    if (this.cache.audio.exists('sfx-level-complete')) {
      this.sound.play('sfx-level-complete', { volume: 0.7 })
    }

    // "+1 UP" pop text above player
    const pop = this.add.text(this.player.x, this.player.y - 80, '+1 UP 🍌', {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffe000',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(999)

    this.tweens.add({
      targets: pop, y: pop.y - 55, alpha: 0,
      duration: 1400, ease: 'Cubic.easeOut',
      onComplete: () => pop.destroy(),
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
    if (!enemy?.active || enemy.aiState === 'ko') return   // dead enemies can't land hits
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
    // Count down — advance only when every expected enemy in this wave has died
    // (enemies.length is unreliable: ko enemies stay active=true for 380ms during death anim)
    this._waveKillCount = Math.max(0, (this._waveKillCount || 0) - 1)
    if (this._waveKillCount > 0 || (this.pendingSpawns || 0) > 0) return
    this.advanceWave()
  }

  onBossDefeated() {
    this.time.timeScale = 1
    this.score += 1000
    this.events.emit('score-update', this.score)

    // Track multi-boss count
    this.activeBossCount = Math.max(0, this.activeBossCount - 1)
    if (this.activeBossCount > 0) return   // wait for all bosses to die

    this._bossSpawning = false            // unlock for any subsequent boss waves
    this._bananaSpawnedThisWave = false   // reset for next boss encounter
    this.enemies = this.enemies.filter(e => e && e.active && e.aiState !== 'ko')  // remove defeated boss(es)

    const nextEntry = this.levelData.waves[this.wave]
    this.time.delayedCall(1200, () => {
      if (!nextEntry) {
        this._resumeLevelMusic()
        this.awaitingAdvance = true
        this.events.emit('advance-prompt', true)
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

      const currentId = this.levelData.id

      // Zone-end lore: after L4, L8, L12 — every 4th level
      if (currentId === 4 || currentId === 8) {
        this.scene.start('Lore', {
          afterLevel: currentId,
          nextLevel:  currentId + 1,
          score:      this.score,
          lives:      this.lives,
        })
        return
      }

      if (currentId === 12) {
        this.scene.start('Lore', {
          afterLevel: 12,
          nextLevel:  null,
          score:      this.score,
          lives:      this.lives,
        })
        return
      }

      if (next >= LEVELS.length) {
        this.scene.start('Win', { score: this.score })
        return
      }

      this.scene.restart({ level: next + 1, score: this.score, lives: this.lives })
    })
  }

  shutdown() {
    this._stopAllMusic()
  }

  applyDepthScale(sprite) {
    if (!sprite || !sprite.scene) return
    const range = this.walkBottom - this.walkTop
    const t = Math.max(0, Math.min(1, (sprite.y - this.walkTop) / range))
    const depthScale = 0.55 + t * 0.45
    const base = sprite._baseDisplayScale ?? 1
    if (sprite.state !== 'special') {
      sprite.setScale(base * depthScale)
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
        if (!this._cinemaMode) this.applyDepthScale(e)
      }
    })
    if (this.awaitingAdvance) {
      const cam = this.cameras.main
      if (this.player.x >= cam.scrollX + cam.width - 140) {
        this.awaitingAdvance = false
        this.events.emit('advance-prompt', false)
        this.nextLevel()
      }
    }

    // Right-only camera follow — camera advances as player moves right, never scrolls back (disabled during boss intro)
    if (!this._cinemaMode) {
      const cam  = this.cameras.main
      const maxX = this.worldW - cam.width
      const desiredX = this.player.x - cam.width / 2
      if (desiredX > cam.scrollX) {
        this._camTargetX = Math.min(desiredX, maxX)
      }
      cam.scrollX = Phaser.Math.Linear(cam.scrollX, this._camTargetX, 0.10)
    }
  }
}
