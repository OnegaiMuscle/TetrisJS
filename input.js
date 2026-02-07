import { handleInput } from './game.js';

export function installInput(canvas) {
    let tX = 0, tY = 0;
    canvas.addEventListener('touchstart', e => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; e.preventDefault(); }, {passive:false});
    canvas.addEventListener('touchend', e => {
        const dX = e.changedTouches[0].clientX - tX, dY = e.changedTouches[0].clientY - tY;
        if (Math.abs(dX) > 30 || Math.abs(dY) > 30) {
            if (Math.abs(dX) > Math.abs(dY)) dX > 0 ? handleInput('RIGHT') : handleInput('LEFT');
            else dY > 0 ? handleInput('HARD_DROP') : handleInput('ROTATE');
        } else {
            const r = canvas.getBoundingClientRect(), x = (e.changedTouches[0].clientX - r.left) / r.width;
            if (x < 0.3) handleInput('LEFT'); else if (x > 0.7) handleInput('RIGHT'); else handleInput('ROTATE');
        }
        e.preventDefault();
    }, {passive:false});

    window.addEventListener('keydown', e => {
        const m = { ArrowLeft:'LEFT', ArrowRight:'RIGHT', ArrowUp:'ROTATE', ArrowDown:'DOWN', ' ':'HARD_DROP' };
        if (m[e.key]) { e.preventDefault(); handleInput(m[e.key]); }
    });
}
