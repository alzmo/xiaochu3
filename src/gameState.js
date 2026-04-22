const {
  GAME_TITLE,
  TEMP_SLOT_LIMIT,
  BIN_CAPACITY,
  BOARD_ROWS,
  BOARD_COLS,
  COLOR_POOL,
} = require('./config');

function createBlocks() {
  const blocks = [];
  let id = 0;

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const colorIndex = (row * BOARD_COLS + col) % COLOR_POOL.length;
      blocks.push({
        id,
        row,
        col,
        color: COLOR_POOL[colorIndex],
        removed: false,
      });
      id += 1;
    }
  }

  return blocks;
}

function createGameState() {
  const state = {
    title: GAME_TITLE,
    blocks: createBlocks(),
    tempSlots: [],
    colorBins: [
      { color: 'red', count: 0, capacity: BIN_CAPACITY },
      { color: 'blue', count: 0, capacity: BIN_CAPACITY },
    ],
    statusText: '方格拾光 V2 核心版',
    layout: {
      blockRects: [],
    },
  };

  function autoStore() {
    for (let i = state.tempSlots.length - 1; i >= 0; i -= 1) {
      const slot = state.tempSlots[i];
      const bin = state.colorBins.find((item) => item.color === slot.color && item.count < item.capacity);

      if (!bin) {
        continue;
      }

      bin.count += 1;
      state.tempSlots.splice(i, 1);

      if (bin.count >= bin.capacity) {
        bin.count = 0;
      }
    }
  }

  function handleTap(x, y) {
    const blockRect = state.layout.blockRects.find((rect) => {
      if (rect.removed) {
        return false;
      }

      return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
    });

    if (!blockRect) {
      return;
    }

    if (state.tempSlots.length >= TEMP_SLOT_LIMIT) {
      state.statusText = '暂存槽已满';
      return;
    }

    const block = state.blocks.find((item) => item.id === blockRect.id && !item.removed);
    if (!block) {
      return;
    }

    block.removed = true;
    state.tempSlots.push({ id: block.id, color: block.color });
    autoStore();
    state.statusText = '方格拾光 V2 核心版';
  }

  function setLayout(layout) {
    state.layout = {
      ...state.layout,
      ...layout,
    };
  }

  function getVisibleBlocks() {
    return state.blocks.filter((block) => !block.removed);
  }

  return {
    state,
    handleTap,
    setLayout,
    getVisibleBlocks,
  };
}

module.exports = {
  createGameState,
};
