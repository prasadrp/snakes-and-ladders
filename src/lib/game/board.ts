import { BOARD_SIZE, TOTAL_CELLS } from './constants';
import { CellCoord } from './types';

/**
 * Returns 0-indexed {row, col} from top-left (0,0) to bottom-right (9,9)
 * and center percentages for SVG overlays (0..100)
 */
export function getCellCoordinates(position: number): CellCoord {
  if (position < 1 || position > TOTAL_CELLS) {
    return { row: 9, col: 0, xPercent: 5, yPercent: 95 };
  }

  const rowFromBottom = Math.floor((position - 1) / BOARD_SIZE);
  const rowFromTop = BOARD_SIZE - 1 - rowFromBottom;
  const indexInRow = (position - 1) % BOARD_SIZE;

  // Even rows from bottom (0, 2, 4...) run Left -> Right
  // Odd rows from bottom (1, 3, 5...) run Right -> Left
  const colFromLeft =
    rowFromBottom % 2 === 0 ? indexInRow : BOARD_SIZE - 1 - indexInRow;

  return {
    row: rowFromTop,
    col: colFromLeft,
    xPercent: (colFromLeft + 0.5) * 10,
    yPercent: (rowFromTop + 0.5) * 10,
  };
}

/**
 * Given row (0..9 from top) and col (0..9 from left),
 * returns board position (1..100)
 */
export function getBoardNumber(row: number, col: number): number {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return 1;
  }
  const rowFromBottom = BOARD_SIZE - 1 - row;
  const indexInRow =
    rowFromBottom % 2 === 0 ? col : BOARD_SIZE - 1 - col;
  return rowFromBottom * BOARD_SIZE + indexInRow + 1;
}

/**
 * Generates all 100 cells with their coordinates and number
 */
export function generateBoardCells() {
  const cells: { number: number; row: number; col: number; isEven: boolean }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const num = getBoardNumber(r, c);
      cells.push({
        number: num,
        row: r,
        col: c,
        isEven: (r + c) % 2 === 0,
      });
    }
  }
  return cells;
}
