import { state, checkCollision, TETROMINOS, COLORS, COLS, ROWS, BS, storage } from './game.js';

export default class Renderer {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.buffer = document.createElement('canvas');
        this.bCtx = this.buffer.getContext('2d');
        this.canvas.width = this.buffer.width = COLS * BS;
        this.canvas.height = this.buffer.height = ROWS * BS;
        this.nextCanvas = document.getElementById('next');
        this.nCtx = this.nextCanvas.getContext('2d');
        this.nextCanvas.width = this.nextCanvas.height = 70;
    }

    drawBlock(c, x, y, color, size, alpha = 1) {
        c.globalAlpha = alpha; c.fillStyle = color;
        c.fillRect(x * size, y * size, size - 1, size - 1);
        c.globalAlpha = 1;
    }

    render() {
        this.ctx.save();
        if (state.shake > 0) { this.ctx.translate((Math.random()-0.5)*state.shake, (Math.random()-0.5)*state.shake); state.shake *= 0.85; }

        this.bCtx.fillStyle = '#000'; this.bCtx.fillRect(0, 0, this.buffer.width, this.buffer.height);

        // Ghost
        let gy = state.piece.y;
        while(!checkCollision(state.grid, state.piece.type, state.piece.x, gy + 1, state.piece.rot)) gy++;
        const mask = TETROMINOS[state.piece.type][state.piece.rot];
        for(let r=0; r<4; r++) for(let c=0; c<4; c++) if (mask & (0x8000 >> (r*4+c))) this.drawBlock(this.bCtx, state.piece.x+c, gy+r, COLORS[state.piece.type], BS, 0.1);

        // Grid
        state.grid.forEach((row, y) => { for (let x = 0; x < COLS; x++) if (row & (1 << (COLS-1-x))) this.drawBlock(this.bCtx, x, y, '#222', BS); });
        // Active
        for(let r=0; r<4; r++) for(let c=0; c<4; c++) if (mask & (0x8000 >> (r*4+c))) this.drawBlock(this.bCtx, state.piece.x+c, state.piece.y+r, COLORS[state.piece.type], BS);

        // Particles
        state.particles.forEach(p => { this.bCtx.fillStyle = p.c; this.bCtx.globalAlpha = p.l; this.bCtx.fillRect(p.x, p.y, 2, 2); this.bCtx.globalAlpha = 1; });

        this.ctx.drawImage(this.buffer, 0, 0);

        // Flashes
        state.flash.forEach(f => { this.ctx.fillStyle = `rgba(255, 255, 255, ${f.a})`; this.ctx.fillRect(0, f.y * BS, this.canvas.width, BS); f.a -= 0.15; });
        state.flash = state.flash.filter(f => f.a > 0);

        // Game Over
        if (state.gameOver) {
            state.overAnim = Math.min(0.8, state.overAnim + 0.01);
            this.ctx.fillStyle = `rgba(0,0,0,${state.overAnim})`;
            this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "#fff"; this.ctx.font = "20px Courier"; this.ctx.textAlign = "center";
            this.ctx.fillText("GAME OVER", this.canvas.width/2, this.canvas.height/2);
        }
        this.ctx.restore();
    }

    renderNext() {
        this.nCtx.clearRect(0,0,70,70); const m = TETROMINOS[state.nextType][0];
        for(let r=0; r<4; r++) for(let c=0; c<4; c++) if(m&(0x8000>>(r*4+c))) this.drawBlock(this.nCtx, c+1, r+1, COLORS[state.nextType], 15);
    }

    updateUI() {
      console.log(state.grid);
        document.getElementById('score').innerText = state.score;
        document.getElementById('best').innerText = storage.getBest();
        document.getElementById('combo-ui').innerText = state.combo;
        if(state.gameOver) storage.setBest(state.score);
    }
}
