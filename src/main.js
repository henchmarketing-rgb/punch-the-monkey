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
  type: Phaser.AUTO,
  width:  1440,
  height: 810,
  backgroundColor: '#07061a',
  pixelArt: true,          // nearest-neighbour filtering — eliminates sprite frame bleed
  roundPixels: true,       // snap to integer pixels — prevents sub-pixel shimmer
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:      1440,
    height:     810,
    // Expand canvas to fill the browser window on all screen sizes
    parent:     document.body,
  },
  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false }
  },
  scene: [BootScene, StoryScene, TitleScene, TransitionScene, GameScene, UIScene, GameOverScene, WinScene]
}

new Phaser.Game(config)
