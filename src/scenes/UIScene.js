export default class UIScene extends Phaser.Scene {
  constructor() { super('UI') }

  init(data) {
    this.levelData  = data.levelData
    this.playerRef  = data.player
    this.initLives  = data.lives !== undefined ? data.lives : 3
  }

  create() {
    const { width, height } = this.scale
    const game = this.scene.get('Game')

    // ── JUNGLE PALETTE ──
    const JC = {
      dark:   0x1a0e05,  // dark bark (frame)
      bg:     0x162808,  // deep jungle (bar bg)
      green:  0x3da820,  // bright leaf green (HP full)
      amber:  0xe88820,  // amber (HP mid / special)
      danger: 0xc42020,  // danger red (HP low)
      leaf:   0x2a6a10,  // deep leaf
      vine:   0x4a8a18,  // vine stem
      gold:   0xd4a020,  // bamboo gold (special)
    }

    // ── HP BAR (jungle themed) ──
    const BAR_X = 70, BAR_Y = 30, BAR_W = 260, BAR_H = 14
    const uiGfx = this.add.graphics().setDepth(100)

    // Frame + bg
    uiGfx.fillStyle(JC.dark, 1)
    uiGfx.fillRoundedRect(BAR_X - 2, BAR_Y - BAR_H / 2 - 2, BAR_W + 4, BAR_H + 4, 3)
    uiGfx.fillStyle(JC.bg, 1)
    uiGfx.fillRect(BAR_X, BAR_Y - BAR_H / 2, BAR_W, BAR_H)

    // Leaf decoration left of bar
    uiGfx.fillStyle(JC.green, 0.92)
    uiGfx.fillEllipse(BAR_X - 22, BAR_Y - 8, 20, 9)
    uiGfx.fillStyle(JC.leaf, 0.92)
    uiGfx.fillEllipse(BAR_X - 16, BAR_Y + 5, 16, 8)
    uiGfx.lineStyle(2, JC.vine, 1)
    uiGfx.lineBetween(BAR_X - 28, BAR_Y + 11, BAR_X - 8, BAR_Y - 9)

    // HP fill (dynamic)
    this.hpBar = this.add.rectangle(BAR_X, BAR_Y, BAR_W, BAR_H, JC.green).setOrigin(0, 0.5).setDepth(101)

    // "HP" label
    this.add.text(BAR_X - 46, BAR_Y, 'HP', {
      fontSize: '11px', fontFamily: 'monospace', color: '#8acc44', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5).setDepth(103)

    // ── SPECIAL BAR (5 bamboo segments) ──
    const SPC_Y = BAR_Y + 22
    const SEG_N = 5, SEG_H = 9, SEG_GAP = 4
    const SEG_W = (BAR_W - SEG_GAP * (SEG_N - 1)) / SEG_N

    // Outer frame
    uiGfx.fillStyle(JC.dark, 1)
    uiGfx.fillRoundedRect(BAR_X - 2, SPC_Y - SEG_H / 2 - 2, BAR_W + 4, SEG_H + 4, 2)

    this.spcSegments = []
    for (let i = 0; i < SEG_N; i++) {
      const sx = BAR_X + i * (SEG_W + SEG_GAP)
      // Segment bg
      uiGfx.fillStyle(JC.bg, 1)
      uiGfx.fillRect(sx, SPC_Y - SEG_H / 2, SEG_W, SEG_H)
      // Bamboo joint (dark divider before each segment except first)
      if (i > 0) {
        uiGfx.fillStyle(JC.dark, 1)
        uiGfx.fillRect(sx - SEG_GAP, SPC_Y - SEG_H / 2 - 2, SEG_GAP, SEG_H + 4)
      }
      const seg = this.add.rectangle(sx, SPC_Y, SEG_W, SEG_H, JC.gold)
        .setOrigin(0, 0.5).setDepth(101).setAlpha(0.2)
      this.spcSegments.push(seg)
    }

    // "SP" label
    // ── LIVES (❤ icons below SP bar) ──
    const LIVES_Y = SPC_Y + 18
    this.livesIcons = []
    for (let i = 0; i < 3; i++) {
      const icon = this.add.text(BAR_X + i * 20, LIVES_Y, '❤', {
        fontSize: '13px', fontFamily: 'monospace', color: '#c42020',
        stroke: '#0a0804', strokeThickness: 2,
      }).setOrigin(0, 0.5).setDepth(101)
      this.livesIcons.push(icon)
    }
    // seed from launch data
    this.livesIcons.forEach((ic, i) => ic.setAlpha(i < this.initLives ? 1 : 0.18))

    this.add.text(BAR_X - 46, SPC_Y, 'SP', {
      fontSize: '11px', fontFamily: 'monospace', color: '#c49020', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5).setDepth(103)

    // ── LEVEL NAME (top centre, jungle green) ──
    const lvlNum  = this.levelData?.id   || ''
    const lvlName = (this.levelData?.name || '').toUpperCase()
    this.add.text(width / 2, 16, lvlNum ? `LVL ${lvlNum}  —  ${lvlName}` : lvlName, {
      fontSize: '14px', fontFamily: 'monospace', color: '#8acc44', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100)

    // ── SCORE (centre, earthy gold) ──
    this.scoreText = this.add.text(width / 2, 32, 'SCORE  0', {
      fontSize: '12px', fontFamily: 'monospace', color: '#d4a020', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100)

    // ── RUNTIME TIMER (top right corner) ──
    this._elapsed = 0
    const timerBg = this.add.rectangle(width - 14, 14, 88, 22, 0x0d1a05, 0.82).setOrigin(1, 0).setDepth(100)
    timerBg.setStrokeStyle(1, 0x3da820, 0.7)
    this.timerText = this.add.text(width - 18, 24, '⏱ 00:00', {
      fontSize: '10px', fontFamily: 'monospace', color: '#8acc44', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(1, 0.5).setDepth(101)

    // ── BOSS HP BAR (top right — mirrors player bar) ──
    const BOSS_RIGHT = width - 60
    const BOSS_Y = BAR_Y
    const BOSS_W = 300
    const bbFrame  = this.add.rectangle(BOSS_RIGHT, BOSS_Y, BOSS_W + 4, BAR_H + 4, 0x1a0e05).setOrigin(1, 0.5).setDepth(100)
    const bbBg     = this.add.rectangle(BOSS_RIGHT, BOSS_Y, BOSS_W,     BAR_H,     0x2a0808).setOrigin(1, 0.5).setDepth(101)
    this.bossBar   = this.add.rectangle(BOSS_RIGHT, BOSS_Y, BOSS_W, BAR_H, 0xc42020).setOrigin(1, 0.5).setDepth(102)
    this.bossLabel = this.add.text(BOSS_RIGHT, BOSS_Y - 14, 'ANGRY GORILLA', {
      fontSize: '12px', fontFamily: 'monospace', color: '#e84040', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(1, 0.5).setDepth(103)
    this.bossBarGroup = this.add.container(0, 0).setDepth(100)
    this.bossBarGroup.add([bbFrame, bbBg, this.bossBar, this.bossLabel])
    this.bossBarGroup.setVisible(false)
    this.bossMaxW = BOSS_W

    // ── PAUSE OVERLAY ──
    this.isPaused = false
    this.pauseGroup = this.add.container(width / 2, height / 2).setDepth(200).setVisible(false)

    // Dark jungle overlay
    const pOverlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.82).setOrigin(0.5)

    // Wood/bark card
    const pCard = this.add.rectangle(0, 0, 480, 360, 0x1a0e05).setOrigin(0.5)
    pCard.setStrokeStyle(3, 0x3da820)

    // Inner accent border (vine green inset line)
    const pInner = this.add.rectangle(0, 0, 464, 344, 0x000000, 0).setOrigin(0.5)
    pInner.setStrokeStyle(1, 0x2a6a10)

    // Leaf corner decorations (Graphics inside container)
    const pGfx = this.add.graphics()
    const leafColor = 0x3da820
    const leafDark  = 0x2a6a10
    // Top-left
    pGfx.fillStyle(leafColor, 0.85); pGfx.fillEllipse(-224, -128, 24, 11)
    pGfx.fillStyle(leafDark,  0.85); pGfx.fillEllipse(-214, -118, 18, 9)
    pGfx.lineStyle(2, 0x4a8a18, 1); pGfx.lineBetween(-232, -120, -208, -132)
    // Top-right
    pGfx.fillStyle(leafColor, 0.85); pGfx.fillEllipse(224, -128, 24, 11)
    pGfx.fillStyle(leafDark,  0.85); pGfx.fillEllipse(214, -118, 18, 9)
    pGfx.lineBetween(232, -120, 208, -132)
    // Bottom corners (mirrored)
    pGfx.fillStyle(leafColor, 0.85); pGfx.fillEllipse(-224, 128, 24, 11)
    pGfx.fillStyle(leafDark,  0.85); pGfx.fillEllipse(-214, 118, 18, 9)
    pGfx.fillStyle(leafColor, 0.85); pGfx.fillEllipse(224, 128, 24, 11)
    pGfx.fillStyle(leafDark,  0.85); pGfx.fillEllipse(214, 118, 18, 9)

    // "PAUSED" title
    const pauseTitle = this.add.text(0, -100, '— PAUSED —', {
      fontSize: '26px', fontFamily: 'monospace', color: '#8acc44',
      stroke: '#0a0804', strokeThickness: 3,
    }).setOrigin(0.5)

    // Divider vine
    const pDiv = this.add.graphics()
    pDiv.lineStyle(1, 0x3da820, 0.6); pDiv.lineBetween(-180, -72, 180, -72)

    // Resume button
    const resumeBtn = this.add.rectangle(0, -16, 280, 46, 0x1a3a08).setOrigin(0.5).setInteractive()
    resumeBtn.setStrokeStyle(1, 0x4a8a18)
    const resumeTxt = this.add.text(0, -16, '▶  RESUME', {
      fontSize: '15px', fontFamily: 'monospace', color: '#c8f080', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5)
    resumeBtn.on('pointerover',  () => resumeBtn.setFillStyle(0x2a5a10))
    resumeBtn.on('pointerout',   () => resumeBtn.setFillStyle(0x1a3a08))
    resumeBtn.on('pointerdown',  () => this.togglePause())

    // Quit button
    const quitBtn  = this.add.rectangle(0, 48, 280, 46, 0x3a0e08).setOrigin(0.5).setInteractive()
    quitBtn.setStrokeStyle(1, 0x7a2a18)
    const quitTxt  = this.add.text(0, 48, '✕  QUIT TO TITLE', {
      fontSize: '15px', fontFamily: 'monospace', color: '#e06050', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5)
    quitBtn.on('pointerover',  () => quitBtn.setFillStyle(0x5a1a10))
    quitBtn.on('pointerout',   () => quitBtn.setFillStyle(0x3a0e08))
    quitBtn.on('pointerdown',  () => {
      const g = this.scene.get('Game')
      if (g.music) g.music.stop()
      this.scene.stop('Game')
      this.scene.stop('UI')
      this.scene.start('Title')
    })

    // Controls reference row
    const ctrlItems = [{ icon: '↑←↓→', desc: 'Move' }, { icon: 'Z', desc: 'Punch' }, { icon: 'X', desc: 'Kick' }, { icon: 'A', desc: 'Special' }]

    const ctrlDivider = this.add.graphics()
    ctrlDivider.lineStyle(1, 0x3da820, 0.3)
    ctrlDivider.lineBetween(-180, 104, 180, 104)

    const ctrlLabel = this.add.text(0, 112, 'CONTROLS', {
      fontSize: '9px', fontFamily: 'monospace', color: '#4a7a18',
    }).setOrigin(0.5)

    const ctrlGfx = this.add.graphics()
    const ctrlObjs = [ctrlDivider, ctrlLabel, ctrlGfx]

    ctrlItems.forEach(({ icon, desc }, i) => {
      const totalW = ctrlItems.length * 90
      const cx = -totalW / 2 + i * 90 + 45
      const cy = 140

      ctrlGfx.fillStyle(0x1a3a08, 0.8)
      ctrlGfx.fillRoundedRect(cx - 18, cy - 18, 36, 26, 3)
      ctrlGfx.lineStyle(1, 0x4a8a18, 0.7)
      ctrlGfx.strokeRoundedRect(cx - 18, cy - 18, 36, 26, 3)

      ctrlObjs.push(this.add.text(cx, cy - 5, icon, {
        fontSize: icon.length > 2 ? '9px' : '13px', fontFamily: 'monospace', color: '#c8f080',
        stroke: '#0a0804', strokeThickness: 1,
      }).setOrigin(0.5))

      ctrlObjs.push(this.add.text(cx, cy + 14, desc.toUpperCase(), {
        fontSize: '8px', fontFamily: 'monospace', color: '#8acc44',
      }).setOrigin(0.5))
    })

    const keyHint = this.add.text(0, 165, 'P or ESC to resume', {
      fontSize: '10px', fontFamily: 'monospace', color: '#4a7a18',
    }).setOrigin(0.5)

    this.pauseGroup.add([pOverlay, pCard, pInner, pGfx, pauseTitle, pDiv, resumeBtn, resumeTxt, quitBtn, quitTxt, ...ctrlObjs, keyHint])

    // ── CONTROLS POPUP (level 1 only) ──
    if (this.levelData?.id === 1) this.showControlsPopup()

    // ── PAUSE BUTTON (bottom right) ──
    const pauseBtn = this.add.text(width - 20, height - 14, '⏸ PAUSE', {
      fontSize: '12px', fontFamily: 'monospace', color: '#8acc44',
      backgroundColor: '#1a0e0599', padding: { x: 8, y: 4 }
    }).setOrigin(1, 1).setDepth(100).setInteractive()
    pauseBtn.on('pointerdown', () => this.togglePause())
    this.pauseBtn = pauseBtn

    // Keyboard pause
    this.input.keyboard.on('keydown-P',   () => this.togglePause())
    this.input.keyboard.on('keydown-ESC', () => this.togglePause())

    // ── DEV: GOD MODE BUTTON (remove before ship) ──
    this._godMode = false
    const godBtn = this.add.text(20, height - 14, '☠ GOD OFF', {
      fontSize: '11px', fontFamily: 'monospace', color: '#555555',
      backgroundColor: '#11110fee', padding: { x: 6, y: 3 }
    }).setOrigin(0, 1).setDepth(100).setInteractive()

    godBtn.on('pointerdown', () => {
      this._godMode = !this._godMode
      const game = this.scene.get('Game')
      if (game?.player) game.player._godMode = this._godMode
      godBtn.setText(this._godMode ? '⚡ GOD ON' : '☠ GOD OFF')
      godBtn.setStyle({ color: this._godMode ? '#ffe000' : '#555555' })
    })

    // G key toggle
    this.input.keyboard.on('keydown-G', () => godBtn.emit('pointerdown'))
    this._godBtn = godBtn

    // ── DEV: LEVEL NAV BUTTONS (remove before ship) ──
    const btnStyle = { fontSize: '11px', fontFamily: 'monospace', color: '#555555', backgroundColor: '#11110fee', padding: { x: 6, y: 3 } }

    const prevBtn = this.add.text(88, height - 14, '◀ LVL', btnStyle)
      .setOrigin(0, 1).setDepth(100).setInteractive()
    prevBtn.on('pointerdown', () => {
      const game  = this.scene.get('Game')
      const cur   = game?.levelData?.id || 1
      const prev  = Math.max(1, cur - 1)
      this.scene.stop('UI')
      game.scene.restart({ level: prev, score: 0, lives: 3 })
    })

    const nextBtn = this.add.text(138, height - 14, 'LVL ▶', btnStyle)
      .setOrigin(0, 1).setDepth(100).setInteractive()
    nextBtn.on('pointerdown', () => {
      const game  = this.scene.get('Game')
      const cur   = game?.levelData?.id || 1
      const next  = Math.min(12, cur + 1)
      this.scene.stop('UI')
      game.scene.restart({ level: next, score: 0, lives: 3 })
    })

    // ── EVENTS FROM GAME ──
    game.events.on('score-update', (score) => {
      this.scoreText.setText('SCORE ' + score)
    }, this)

    // Low-HP state tracking (Street Fighter style)
    this._lowHealthActive = false
    this._lowHealthTween  = null
    this._lowHealthSound  = null

    const LOW_HP_THRESHOLD = 0.15

    const startLowHealthEffect = () => {
      if (this._lowHealthActive) return
      this._lowHealthActive = true

      // Play the warning sound once, then repeat every 3.5s while still low
      const playWarning = () => {
        if (!this._lowHealthActive) return
        if (this.cache.audio.exists('sfx-health-low')) {
          const snd = this.sound.add('sfx-health-low', { volume: 0.75 })
          snd.play()
          snd.once('complete', () => snd.destroy())
        }
        this._lowHealthTimer = this.time.delayedCall(3500, () => {
          if (this._lowHealthActive) playWarning()
        })
      }
      playWarning()

      // Pulse the bar: flash rapidly between red and dark red (SF-style)
      this._lowHealthTween = this.tweens.add({
        targets: this.hpBar,
        alpha: 0.25,
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }

    const stopLowHealthEffect = () => {
      if (!this._lowHealthActive) return
      this._lowHealthActive = false
      if (this._lowHealthTween) { this._lowHealthTween.stop(); this._lowHealthTween = null }
      if (this._lowHealthTimer) { this._lowHealthTimer.remove(); this._lowHealthTimer = null }
      this.hpBar.setAlpha(1)
    }

    const updateHpBar = (hp) => {
      const player = this.scene.get('Game')?.player
      if (!player) return
      const pct = hp / player.maxHp
      const w = Math.max(0, Math.floor(260 * pct))
      this.hpBar.width = w

      if (pct <= LOW_HP_THRESHOLD) {
        this.hpBar.setFillStyle(0xc42020)
        startLowHealthEffect()
      } else {
        stopLowHealthEffect()
        if (pct > 0.5)       this.hpBar.setFillStyle(0x3da820)
        else if (pct > 0.25) this.hpBar.setFillStyle(0xe88820)
        else                  this.hpBar.setFillStyle(0xc42020)
      }
    }
    game.events.on('player-hurt',  updateHpBar, this)
    game.events.on('player-regen', updateHpBar, this)

    // Clean up low-health effect when player dies
    game.events.once('player-ko', () => stopLowHealthEffect(), this)

    // ── ADVANCE PROMPT (walk-to-right arrow) ──
    this.advancePrompt = this.add.text(width - 28, height / 2, '▶▶', {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffdd88',
      stroke: '#000000', strokeThickness: 3,
      backgroundColor: '#00000088', padding: { x: 12, y: 6 },
    }).setOrigin(1, 0.5).setDepth(110).setVisible(false)
    this._advanceTween = null

    game.events.on('advance-prompt', (show) => {
      this.advancePrompt.setVisible(show)
      if (show) {
        if (this._advanceTween) this._advanceTween.stop()
        this.advancePrompt.setAlpha(1)
        this._advanceTween = this.tweens.add({
          targets: this.advancePrompt,
          alpha: 0.3, duration: 500, yoyo: true, repeat: -1,
          ease: 'Sine.easeInOut',
        })
      } else {
        if (this._advanceTween) { this._advanceTween.stop(); this._advanceTween = null }
        this.advancePrompt.setAlpha(0)
      }
    }, this)

    game.events.on('boss-spawn', () => {
      this.bossBarGroup.setVisible(true)
    }, this)

    game.events.on('boss-hp-update', ({ hp, maxHp }) => {
      const pct = Math.max(0, hp / maxHp)
      this.bossBar.width = Math.floor(this.bossMaxW * pct)
    }, this)

    game.events.on('lives-update', (remaining) => {
      this.livesIcons.forEach((ic, i) => ic.setAlpha(i < remaining ? 1 : 0.18))
    })

    game.events.on('boss-defeated', () => {
      this.bossBarGroup.setVisible(false)
    }, this)
  }

  shutdown() {
    // Kill low-health repeating timer and tween so they don't fire after scene ends
    if (this._lowHealthTimer) { this._lowHealthTimer.destroy(); this._lowHealthTimer = null }
    if (this._lowHealthTween) { this._lowHealthTween.stop();   this._lowHealthTween = null }
    this._lowHealthActive = false
    this._spcLit = -1
  }

  update(time, delta) {
    // ── Runtime timer ──
    if (this.timerText && !this.isPaused) {
      this._elapsed = (this._elapsed || 0) + delta
      const secs = Math.floor(this._elapsed / 1000)
      const mm   = String(Math.floor(secs / 60)).padStart(2, '0')
      const ss   = String(secs % 60).padStart(2, '0')
      this.timerText.setText(`⏱ ${mm}:${ss}`)
    }

    // Drive bamboo special segments — lightweight: alpha only, early-exit if unchanged
    const player = this.scene.get('Game')?.player
    if (!player || !this.spcSegments?.length) return
    const lit = player.specialCooldown <= 0
      ? this.spcSegments.length
      : Math.floor((1 - Math.min(1, player.specialCooldown / 5000)) * this.spcSegments.length)
    if (lit === this._spcLit) return   // nothing changed — skip entirely
    this._spcLit = lit
    this.spcSegments.forEach((seg, i) => seg.setAlpha(i < lit ? 1 : 0.18))
  }

  createTouchControls() {
    const { width, height } = this.scale
    const BTN = 60
    const PAD = { x: 120, y: height - 100 }

    const makeBtn = (x, y, label, onDown, onUp) => {
      const bg = this.add.rectangle(x, y, BTN, BTN, 0x000000, 0.45).setDepth(150).setInteractive()
      const tx = this.add.text(x, y, label, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setDepth(151)
      bg.on('pointerdown',  onDown)
      bg.on('pointerup',    onUp)
      bg.on('pointerout',   onUp)
      return { bg, tx }
    }

    const getPlayer = () => this.scene.get('Game')?.player

    makeBtn(PAD.x - 70, PAD.y,      '◀', () => { const p=getPlayer(); if(p) p.touchKeys.left  = true  }, () => { const p=getPlayer(); if(p) p.touchKeys.left  = false })
    makeBtn(PAD.x + 70, PAD.y,      '▶', () => { const p=getPlayer(); if(p) p.touchKeys.right = true  }, () => { const p=getPlayer(); if(p) p.touchKeys.right = false })
    makeBtn(PAD.x,      PAD.y - 65, '▲', () => { const p=getPlayer(); if(p) p.touchKeys.up    = true  }, () => { const p=getPlayer(); if(p) p.touchKeys.up    = false })
    makeBtn(PAD.x,      PAD.y,      '▼', () => { const p=getPlayer(); if(p) p.touchKeys.down  = true  }, () => { const p=getPlayer(); if(p) p.touchKeys.down  = false })

    // Action buttons (circles approximated as rectangles)
    const ACT = { x: width - 180, y: height - 100 }
    const makeAct = (x, y, label, color, key) => {
      const bg = this.add.circle(x, y, 35, color, 0.7).setDepth(150).setInteractive()
      const tx = this.add.text(x, y, label, { fontSize: '14px', fontFamily: 'monospace', color: '#ffffff' }).setOrigin(0.5).setDepth(151)
      bg.on('pointerdown',  () => { const p=getPlayer(); if(p) p.touchKeys[key] = true  })
      bg.on('pointerup',    () => { const p=getPlayer(); if(p) p.touchKeys[key] = false })
      bg.on('pointerout',   () => { const p=getPlayer(); if(p) p.touchKeys[key] = false })
    }

    makeAct(ACT.x,      ACT.y,      'PUNCH', 0xff6600, 'punch')
    makeAct(ACT.x + 90, ACT.y,      'KICK',  0x2266ff, 'kick')
    makeAct(ACT.x + 45, ACT.y - 75, 'SPEC',  0x8800cc, 'special')
  }

  showControlsPopup() {
    const { width, height } = this.scale
    const DEPTH = 200
    const items = [
      { icon: '↑←↓→', desc: 'Move'    },
      { icon: 'Z',     desc: 'Punch'   },
      { icon: 'X',     desc: 'Kick'    },
      { icon: 'A',     desc: 'Special' },
    ]

    const cardW = 340, cardH = 155
    const cx = width / 2, cy = height / 2
    const all = []

    // Overlay
    const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.55)
      .setScrollFactor(0).setDepth(DEPTH)
    all.push(overlay)

    // Card
    const card = this.add.graphics().setScrollFactor(0).setDepth(DEPTH + 1)
    card.fillStyle(0x0f1a07, 0.97)
    card.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10)
    card.lineStyle(2, 0x3da820, 0.9)
    card.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 10)
    card.lineStyle(1, 0x2a6a10, 0.45)
    card.strokeRoundedRect(cx - cardW / 2 + 5, cy - cardH / 2 + 5, cardW - 10, cardH - 10, 7)
    all.push(card)

    // Title
    all.push(this.add.text(cx, cy - cardH / 2 + 22, '— CONTROLS —', {
      fontSize: '12px', fontFamily: 'monospace', color: '#8acc44',
      stroke: '#0a0804', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 2))

    // Divider
    const dg = this.add.graphics().setScrollFactor(0).setDepth(DEPTH + 2)
    dg.lineStyle(1, 0x3da820, 0.3)
    dg.lineBetween(cx - cardW / 2 + 24, cy - cardH / 2 + 40, cx + cardW / 2 - 24, cy - cardH / 2 + 40)
    all.push(dg)

    // Control items
    const colW = cardW / items.length
    items.forEach(({ icon, desc }, i) => {
      const ix = cx - cardW / 2 + colW * i + colW / 2
      const iy = cy - 5

      const kg = this.add.graphics().setScrollFactor(0).setDepth(DEPTH + 2)
      kg.fillStyle(0x1a3a08, 0.9)
      kg.fillRoundedRect(ix - 20, iy - 22, 40, 30, 4)
      kg.lineStyle(1, 0x4a8a18, 0.85)
      kg.strokeRoundedRect(ix - 20, iy - 22, 40, 30, 4)
      kg.lineStyle(1, 0x8acc44, 0.2)
      kg.lineBetween(ix - 17, iy - 21, ix + 17, iy - 21)
      all.push(kg)

      all.push(this.add.text(ix, iy - 11, icon, {
        fontSize: icon.length > 2 ? '10px' : '14px',
        fontFamily: 'monospace', color: '#c8f080',
        stroke: '#0a0804', strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 3))

      all.push(this.add.text(ix, iy + 20, desc.toUpperCase(), {
        fontSize: '8px', fontFamily: 'monospace', color: '#8acc44',
        stroke: '#0a0804', strokeThickness: 2,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 3))
    })

    // Hint
    all.push(this.add.text(cx, cy + cardH / 2 - 16, 'tap anywhere or press any key to dismiss', {
      fontSize: '8px', fontFamily: 'monospace', color: '#4a7a18',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH + 2))

    // Fade in
    all.forEach(o => o.setAlpha(0))
    this.tweens.add({ targets: all, alpha: 1, duration: 400, ease: 'Sine.easeOut' })

    const dismiss = () => {
      this.tweens.add({
        targets: all, alpha: 0, duration: 500, ease: 'Sine.easeIn',
        onComplete: () => all.forEach(o => { if (o && o.destroy) o.destroy() }),
      })
    }

    this.time.delayedCall(4000, dismiss)
    // Delay input listeners — avoids the tap that launched the game instantly dismissing the popup
    this.time.delayedCall(900, () => {
      this.input.once('pointerdown', dismiss)
      this.input.keyboard.once('keydown', dismiss)
    })
  }

    togglePause() {
    const game = this.scene.get('Game')
    this.isPaused = !this.isPaused
    this.pauseGroup.setVisible(this.isPaused)
    this.pauseBtn.setText(this.isPaused ? '▶ RESUME' : '⏸ PAUSE')

    if (this.isPaused) {
      game.scene.pause()
      game.music?.pause()
    } else {
      game.scene.resume()
      game.music?.resume()
    }
  }
}
