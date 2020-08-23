import browserData from './browserData.json';
import Game from './Game';
import structureData from './structureData.json';

const game = new Game(document.getElementById('canvas') as HTMLCanvasElement);
game.setup();

game.onDataChange(structureData, browserData);
game.animate();
