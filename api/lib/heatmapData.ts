import type { MoveRecord, HeatmapData } from "@shared/types";

export function generateHeatmap(moves: MoveRecord[]): HeatmapData {
  const grid: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  moves.forEach((move) => {
    const { x, y, elapsedMs } = move;
    
    let baseValue = 100;
    if (elapsedMs > 5000) {
      baseValue = 80;
    } else if (elapsedMs < 2000) {
      baseValue = 120;
    }

    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < 9 && ny >= 0 && ny < 9) {
          const distance = Math.abs(dx) + Math.abs(dy);
          const decay = Math.max(0, 1 - distance / 3);
          grid[ny][nx] += Math.round(baseValue * decay * decay);
        }
      }
    }
  });

  const maxVal = Math.max(...grid.flat());
  if (maxVal > 0) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        grid[y][x] = Math.round((grid[y][x] / maxVal) * 100);
      }
    }
  }

  const peaks: { x: number; y: number; value: number }[] = [];
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (grid[y][x] >= 60) {
        peaks.push({ x, y, value: grid[y][x] });
      }
    }
  }
  peaks.sort((a, b) => b.value - a.value);

  return {
    grid,
    peaks: peaks.slice(0, 5),
  };
}