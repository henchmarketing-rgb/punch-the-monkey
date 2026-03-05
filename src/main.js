import Phaser from 'phaser'
import BootScene       from './scenes/BootScene.js'
import StoryScene      from './scenes/StoryScene.js'
import TitleScene      from './scenes/TitleScene.js'
import TransitionScene from './scenes/TransitionScene.js'
import GameScene       from './scenes/GameScene.js'
import UIScene         from './scenes/UIScene.js'
import GameOverScene   from './scenes/GameOverScene.js'
import WinScene        from './scenes/WinScene.js'

// Safari WebGL can silently fail — fall back to Canvas renderer
const isSafari = typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

const config = {
  type: isSafari ? Phaser.CANVAS : Phaser.AUTO,
  width:  1440,
  height: 810,
  backgroundColor: '#07061a',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, StoryScene, TitleScene, TransitionScene, GameScene, UIScene, GameOverScene, WinScene]
}

new Phaser.Game(config)
