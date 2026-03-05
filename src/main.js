import Phaser from 'phaser'
import BootScene       from './scenes/BootScene.js'
import StoryScene      from './scenes/StoryScene.js'
import TitleScene      from './scenes/TitleScene.js'
import TransitionScene from './scenes/TransitionScene.js'
import GameScene       from './scenes/GameScene.js'
import UIScene         from './scenes/UIScene.js'
import GameOverScene   from './scenes/GameOverScene.js'
import WinScene        from './scenes/WinScene.js'

const config = {
  type: Phaser.CANVAS,
  parent: 'game-container',
  width:  1440,
  height: 810,
  backgroundColor: '#07061a',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode:       Phaser.Scale.EXPAND,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent:     'game-container',
  },
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, StoryScene, TitleScene, TransitionScene, GameScene, UIScene, GameOverScene, WinScene]
}

try {
  window.game = new Phaser.Game(config)
} catch (e) {
  document.body.innerHTML = `
    <div style="color:#8acc44;font-family:monospace;text-align:center;padding:60px 20px;background:#0a0a0a;min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:16px;">
      <div style="font-size:48px">🐒</div>
      <div style="font-size:20px;color:#ff8c00">PUNCH-KUN failed to start</div>
      <div style="font-size:13px;color:#555;max-width:400px">${e.message || 'Unknown error'}</div>
      <div style="font-size:12px;color:#444">Try opening in Chrome or Firefox</div>
      <button onclick="location.reload()" style="margin-top:12px;padding:10px 24px;background:#1a3a08;color:#8acc44;border:1px solid #3da820;border-radius:4px;font-family:monospace;font-size:13px;cursor:pointer">↺ Retry</button>
    </div>`
}
