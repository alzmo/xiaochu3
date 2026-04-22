const { createGameState } = require('./src/gameState');
const { createRenderer } = require('./src/renderer');

const systemInfo = typeof wx !== 'undefined' && wx.getSystemInfoSync ? wx.getSystemInfoSync() : { windowWidth: 375, windowHeight: 667 };
const canvas = typeof wx !== 'undefined' && wx.createCanvas ? wx.createCanvas() : document.createElement('canvas');

canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

const gameState = createGameState();
const renderer = createRenderer(canvas, gameState);

function getTouchPoint(event) {
  if (!event) {
    return null;
  }

  if (event.touches && event.touches.length > 0) {
    return event.touches[0];
  }

  if (event.changedTouches && event.changedTouches.length > 0) {
    return event.changedTouches[0];
  }

  if (typeof event.clientX === 'number' && typeof event.clientY === 'number') {
    return { x: event.clientX, y: event.clientY };
  }

  return null;
}

function onTap(event) {
  const touch = getTouchPoint(event);
  if (!touch) {
    return;
  }

  gameState.handleTap(touch.x, touch.y);
}

if (typeof wx !== 'undefined' && wx.onTouchStart) {
  wx.onTouchStart(onTap);
} else if (canvas.addEventListener) {
  canvas.addEventListener('click', onTap);
  if (typeof document !== 'undefined' && !canvas.parentNode) {
    document.body.appendChild(canvas);
  }
}

function loop() {
  renderer.render();

  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(loop);
  } else if (typeof wx !== 'undefined' && wx.nextTick) {
    wx.nextTick(loop);
  } else {
    setTimeout(loop, 16);
  }
}

loop();
