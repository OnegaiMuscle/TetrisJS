export function createInputManager() {
  const INPUT = {
    LEFT:  1 << 0,
    RIGHT: 1 << 1,
    UP:    1 << 2,
    DOWN:  1 << 3,
    JUMP:  1 << 4,
    FIRE:  1 << 5
  };

  let state = 0;
  let gamepad = null;

  const KEYMAP = {
    ArrowLeft:  INPUT.LEFT,
    ArrowRight: INPUT.RIGHT,
    ArrowUp:    INPUT.UP,
    ArrowDown:  INPUT.DOWN,
    Space:      INPUT.JUMP,
    KeyZ:       INPUT.FIRE
  };

  const GAMEPAD_MAP = {
    12: INPUT.UP,
    13: INPUT.DOWN,
    14: INPUT.LEFT,
    15: INPUT.RIGHT,
    0:  INPUT.JUMP,
    1:  INPUT.FIRE
  };

  // Initialisation
  document.addEventListener("keydown", e => {
    const flag = KEYMAP[e.code];
    if (flag) state |= flag;
  });

  document.addEventListener("keyup", e => {
    const flag = KEYMAP[e.code];
    if (flag) state &= ~flag;
  });

  window.addEventListener("gamepadconnected", e => {
    gamepad = navigator.getGamepads()[e.gamepad.index];
  });

  window.addEventListener("gamepaddisconnected", () => {
    gamepad = null;
  });

  function pollGamepad() {
    if (!gamepad) return;

    const gp = navigator.getGamepads()[gamepad.index];
    if (!gp) return;

    state &= ~(INPUT.LEFT | INPUT.RIGHT | INPUT.UP | INPUT.DOWN | INPUT.JUMP | INPUT.FIRE);

    gp.buttons.forEach((btn, index) => {
      if (btn.pressed && GAMEPAD_MAP[index]) {
        state |= GAMEPAD_MAP[index];
      }
    });

    const x = gp.axes[0];
    const y = gp.axes[1];

    if (x < -0.3) state |= INPUT.LEFT;
    if (x >  0.3) state |= INPUT.RIGHT;
    if (y < -0.3) state |= INPUT.UP;
    if (y >  0.3) state |= INPUT.DOWN;
  }

  function isDown(flag) {
    return (state & flag) !== 0;
  }

  return {
    INPUT,
    pollGamepad,
    isDown
  };
}
