import * as game from './game.js';
import Renderer from './renderer.js';
import { installInput } from './input.js';

const renderer = new Renderer();
game.setRenderCallbacks({ renderNext: renderer.renderNext.bind(renderer), updateUI: renderer.updateUI.bind(renderer) });
installInput(renderer.canvas);
game.init();
renderer.renderNext(); renderer.updateUI(); renderer.render();
game.startLoop(renderer.render.bind(renderer));
