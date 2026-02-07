// Game model and logic (exports state and control functions)
export const COLS = 10, ROWS = 20, BS = 30;
export const TETROMINOS = {
    I: [0x0F00, 0x2222, 0x00F0, 0x4444], J: [0x44C0, 0x8E00, 0x6440, 0x0E20],
    L: [0x4460, 0x0E80, 0xC440, 0x2E00], O: [0xCC00, 0xCC00, 0xCC00, 0xCC00],
    S: [0x06C0, 0x8C40, 0x6C00, 0x4620], T: [0x0E40, 0x4C40, 0x4E00, 0x4640], Z: [0x0C60, 0x4C80, 0xC600, 0x2640]
};
export const COLORS = { I: '#0ef', J: '#33f', L: '#f70', O: '#ff0', S: '#0f0', T: '#a0f', Z: '#f00' };

export const checkCollision = (grid, type, x, y, rot) => {
    const mask = TETROMINOS[type][rot];
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (mask & (0x8000 >> (r * 4 + c))) {
                const tx = x + c, ty = y + r;
                if (tx < 0 || tx >= COLS || ty >= ROWS || (ty >= 0 && (grid[ty] & (1 << (COLS - 1 - tx))))) return true;
            }
        }
    }
    return false;
};

export const storage = {
    getBest: () => parseInt(localStorage.getItem('t-best') || '0', 10),
    setBest: (s) => { if (s > storage.getBest()) localStorage.setItem('t-best', String(s)); }
};

export let state = {
    grid: new Uint16Array(ROWS).fill(0),
    piece: null, nextType: null,
    score: 0, lines: 0, combo: 0,
    particles: [], flash: [], shake: 0,
    gameOver: false, overAnim: 0,
    lastTime: 0, dropCounter: 0
};

let callbacks = { renderNext: () => {}, updateUI: () => {} };
export function setRenderCallbacks(cb) { Object.assign(callbacks, cb); }

export function randomType() { return "IJLOTSZ"[(Math.random()*7)|0]; }

export function init() {
    state.nextType = randomType();
    state.piece = { type: randomType(), x: 3, y: 0, rot: 0 };
}

export const handleInput = (action) => {
    if (state.gameOver) return;
    const { x, y, rot, type } = state.piece;
    if (action === 'LEFT' && !checkCollision(state.grid, type, x - 1, y, rot)) state.piece.x--;
    if (action === 'RIGHT' && !checkCollision(state.grid, type, x + 1, y, rot)) state.piece.x++;
    if (action === 'ROTATE' && !checkCollision(state.grid, type, x, y, (rot + 1) % 4)) state.piece.rot = (rot + 1) % 4;
    if (action === 'DOWN') { if (!checkCollision(state.grid, type, x, y + 1, rot)) state.piece.y++; else lockPiece(); }
    if (action === 'HARD_DROP') {
        let d = 0; while(!checkCollision(state.grid, type, x, state.piece.y+1, rot)) { state.piece.y++; d++; }
        state.shake = Math.min(d, 15); lockPiece();
    }
};

export const lockPiece = () => {
    const { x, y, rot, type } = state.piece, mask = TETROMINOS[type][rot];
    for(let r=0; r<4; r++) for(let c=0; c<4; c++) if (mask & (0x8000 >> (r*4+c))) if(y+r < ROWS) state.grid[y+r] |= (1 << (COLS-1-(x+c)));

    const full = (1 << COLS) - 1, toClear = [];
    state.grid.forEach((row, i) => { if(row === full) toClear.push(i); });

    if (toClear.length > 0) {
        state.combo++; state.flash = toClear.map(ly => ({y: ly, a: 1})); state.shake = toClear.length * 12;
        state.score += [0, 100, 300, 500, 800][toClear.length] * state.combo;
        state.lines += toClear.length;
        for(let i=0; i<40; i++) state.particles.push({x: Math.random()*COLS*BS, y: toClear[0]*BS, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, l: 1, c: '#fff'});
        setTimeout(() => {
            const nGrid = Array.from(state.grid).filter(r => r !== full);
            state.grid = new Uint16Array(ROWS);
            state.grid.set(nGrid, ROWS - nGrid.length);
        }, 120);
    } else state.combo = 0;

    state.piece = { type: state.nextType, x: 3, y: 0, rot: 0 };
    state.nextType = randomType();
    callbacks.renderNext();
    if (checkCollision(state.grid, state.piece.type, state.piece.x, state.piece.y, state.piece.rot)) state.gameOver = true;
    callbacks.updateUI();
};

export function startLoop(renderFunc) {
    function loop(t = 0) {
        const dt = t - state.lastTime; state.lastTime = t; state.dropCounter += dt;
        const speed = Math.max(70, 800 - (Math.floor(state.lines / 20) * 150));
        if (state.dropCounter > speed && !state.gameOver) { handleInput('DOWN'); state.dropCounter = 0; }
        state.particles = state.particles.map(p => ({...p, x: p.x+p.vx, y: p.y+p.vy, l: p.l-0.03})).filter(p => p.l > 0);
        renderFunc(); requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
