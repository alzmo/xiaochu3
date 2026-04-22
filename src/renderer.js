const { BOARD_ROWS, BOARD_COLS, TEMP_SLOT_LIMIT } = require('./config');

function createRenderer(canvas, gameStateApi) {
  const ctx = canvas.getContext('2d');

  function drawRoundedRect(x, y, w, h, r, color) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function render() {
    const { state } = gameStateApi;
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f2f2f2';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#222';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.title, width / 2, 50);

    const boardSize = Math.min(width - 40, height * 0.45);
    const boardX = (width - boardSize) / 2;
    const boardY = 90;
    const gap = 8;
    const cellSize = (boardSize - gap * (BOARD_COLS - 1)) / BOARD_COLS;

    ctx.fillStyle = '#ffffff';
    drawRoundedRect(boardX - 10, boardY - 10, boardSize + 20, boardSize + 20, 12, '#ffffff');

    const blockRects = [];
    const visibleBlocks = gameStateApi.getVisibleBlocks();

    visibleBlocks.forEach((block) => {
      const x = boardX + block.col * (cellSize + gap);
      const y = boardY + block.row * (cellSize + gap);
      drawRoundedRect(x, y, cellSize, cellSize, 10, block.color);
      blockRects.push({ id: block.id, x, y, w: cellSize, h: cellSize, removed: block.removed });
    });

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const x = boardX + col * (cellSize + gap);
        const y = boardY + row * (cellSize + gap);
        ctx.strokeStyle = '#ddd';
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }

    gameStateApi.setLayout({ blockRects });

    const slotY = boardY + boardSize + 40;
    const slotGap = 10;
    const slotW = (width - 40 - slotGap * (TEMP_SLOT_LIMIT - 1)) / TEMP_SLOT_LIMIT;
    const slotH = 40;

    ctx.fillStyle = '#222';
    ctx.font = '18px sans-serif';
    ctx.fillText('暂存槽', width / 2, slotY - 18);

    for (let i = 0; i < TEMP_SLOT_LIMIT; i += 1) {
      const x = 20 + i * (slotW + slotGap);
      const slotItem = state.tempSlots[i];
      drawRoundedRect(x, slotY, slotW, slotH, 8, slotItem ? slotItem.color : '#ffffff');
      ctx.strokeStyle = '#bbb';
      ctx.strokeRect(x, slotY, slotW, slotH);
    }

    const binsY = slotY + slotH + 55;
    const binW = (width - 60) / state.colorBins.length;
    const binH = 65;

    ctx.fillStyle = '#222';
    ctx.fillText('收纳篮', width / 2, binsY - 18);

    state.colorBins.forEach((bin, index) => {
      const x = 20 + index * (binW + 20);
      drawRoundedRect(x, binsY, binW, binH, 10, '#fff');
      ctx.strokeStyle = '#bbb';
      ctx.strokeRect(x, binsY, binW, binH);

      drawRoundedRect(x + 10, binsY + 10, 24, 24, 6, bin.color);
      ctx.fillStyle = '#222';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${bin.color} ${bin.count}/${bin.capacity}`, x + 42, binsY + 23);
      ctx.textAlign = 'center';
    });

    const statusY = binsY + binH + 35;
    ctx.fillStyle = '#333';
    ctx.font = '16px sans-serif';
    ctx.fillText(state.statusText, width / 2, statusY);
  }

  return {
    render,
  };
}

module.exports = {
  createRenderer,
};
