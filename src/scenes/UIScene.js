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
    this.add.text(width / 2, 16, (this.levelData?.name || '').toUpperCase(), {
      fontSize: '14px', fontFamily: 'monospace', color: '#8acc44', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100)

    // ── SCORE (centre, earthy gold) ──
    this.scoreText = this.add.text(width / 2, 32, 'SCORE  0', {
      fontSize: '12px', fontFamily: 'monospace', color: '#d4a020', stroke: '#0a0804', strokeThickness: 2
    }).setOrigin(0.5).setDepth(100)

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
    const pCard = this.add.rectangle(0, 0, 480, 290, 0x1a0e05).setOrigin(0.5)
    pCard.setStrokeStyle(3, 0x3da820)

    // Inner accent border (vine green inset line)
    const pInner = this.add.rectangle(0, 0, 464, 274, 0x000000, 0).setOrigin(0.5)
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

    // Key hint
    const keyHint = this.add.text(0, 118, 'P or ESC to resume', {
      fontSize: '10px', fontFamily: 'monospace', color: '#4a7a18',
    }).setOrigin(0.5)

    this.pauseGroup.add([pOverlay, pCard, pInner, pGfx, pauseTitle, pDiv, resumeBtn, resumeTxt, quitBtn, quitTxt, keyHint])

    // ── KEY LEGEND (bottom left, glass style) ──
    this.createKeyLegend()

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

    // ── TOUCH CONTROLS ──
    // Only show touch controls on mobile / touch devices
    const isMobile = this.sys.game.device.input.touch || window.matchMedia('(pointer: coarse)').matches
    if (isMobile) this.createTouchControls()

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

  update() {
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

  createKeyLegend() {
    const { height } = this.scale
    const KS  = 17    // key cap size (px)
    const KG  = 3     // gap between keys
    const PAD = 7     // container padding
    const DEPTH = 106

    // Container anchor — bottom left
    const ox = 12
    const oy = height - 12

    // Layout measurements
    const arrowW  = 3 * (KS + KG) - KG   // 3 cols
    const arrowH  = 2 * (KS + KG) - KG   // 2 rows
    const actW    = 3 * (KS + KG) - KG
    const sepW    = 10
    const lblH    = 11                    // label row height
    const totalW  = arrowW + sepW + actW + PAD * 2
    const totalH  = arrowH + lblH + 6 + PAD * 2

    // Glass backing
    const gfx = this.add.graphics().setDepth(DEPTH)
    gfx.fillStyle(0x080808, 0.30)
    gfx.fillRoundedRect(ox, oy - totalH, totalW, totalH, 5)
    gfx.lineStyle(1, 0xffffff, 0.13)
    gfx.strokeRoundedRect(ox, oy - totalH, totalW, totalH, 5)
    // top glass sheen line
    gfx.lineStyle(1, 0xffffff, 0.10)
    gfx.lineBetween(ox + 5, oy - totalH + 1, ox + totalW - 5, oy - totalH + 1)

    const drawKey = (x, y, label, alpha = 0.75) => {
      // Key cap body
      gfx.fillStyle(0x1a1a2e, 0.55)
      gfx.fillRoundedRect(x, y, KS, KS, 2.5)
      // Border
      gfx.lineStyle(1, 0xffffff, 0.22)
      gfx.strokeRoundedRect(x, y, KS, KS, 2.5)
      // Top highlight edge (glass sheen)
      gfx.lineStyle(1, 0xffffff, 0.18)
      gfx.lineBetween(x + 2, y + 1, x + KS - 2, y + 1)
      // Label text centred on key
      this.add.text(x + KS / 2, y + KS / 2, label, {
        fontSize: '8px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5).setDepth(DEPTH + 1).setAlpha(alpha)
    }

    // ── Arrow key cluster ──
    // Top row: ↑ centred (col 1)
    const ax = ox + PAD
    const ay = oy - totalH + PAD

    drawKey(ax + KS + KG,        ay,            '↑')            // up
    drawKey(ax,                  ay + KS + KG,  '←')            // left
    drawKey(ax + KS + KG,        ay + KS + KG,  '↓')            // down
    drawKey(ax + (KS + KG) * 2,  ay + KS + KG,  '→')            // right

    // MOVE label under arrow cluster
    this.add.text(ax + arrowW / 2, ay + arrowH + 5, 'MOVE', {
      fontSize: '7px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(DEPTH + 1).setAlpha(0.55)

    // ── Thin divider ──
    const divX = ax + arrowW + sepW / 2
    gfx.lineStyle(1, 0xffffff, 0.08)
    gfx.lineBetween(divX, oy - totalH + PAD + 3, divX, oy - PAD - lblH - 3)

    // ── Action keys (Z, X, A) ──
    const bx = ax + arrowW + sepW
    const by = ay + KS / 2 + 1   // vertically centred with arrow cluster

    const actions = [
      { lbl: 'Z', sub: 'PUNCH' },
      { lbl: 'X', sub: 'KICK'  },
      { lbl: 'A', sub: 'SPEC'  },
    ]
    actions.forEach(({ lbl, sub }, i) => {
      const kx = bx + i * (KS + KG)
      drawKey(kx, by, lbl)
      this.add.text(kx + KS / 2, by + KS + 4, sub, {
        fontSize: '6px', fontFamily: 'monospace', color: '#aaaaaa',
      }).setOrigin(0.5).setDepth(DEPTH + 1).setAlpha(0.50)
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
