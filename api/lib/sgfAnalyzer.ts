/**
 * 棋谱（SGF）规则特征提取引擎
 * 不依赖 AI 引擎，基于落子几何位置与序列进行启发式心理分析
 */

import type { SgfMove, ParsedSgf } from "./sgf.js";

/** 五维心理雷达（0-100） */
export interface SgfRadar {
  riskAppetite: number; // 风险偏好（激进 vs 保守）
  resilience: number; // 逆境抗压
  rationality: number; // 决策理性度（越高越理性，低=沉没成本）
  conflictResponse: number; // 冲突应对（高=对抗型，低=妥协型）
  focus: number; // 长效专注力
}

/** 关键棋局节点 */
export interface KeyMoment {
  moveNumber: number;
  color: "B" | "W";
  x: number;
  y: number;
  type: "invasion" | "resist" | "giveUp" | "territory" | "influence" | "endgame";
  description: string;
}

/** 完整分析结果 */
export interface SgfAnalysis {
  radar: SgfRadar;
  tags: string[];
  keyMoments: KeyMoment[];
  moveCount: number;
  boardSize: number;
  // 供前端复用的结构
  heatmap: { grid: number[][]; peaks: { x: number; y: number; value: number }[] };
}

// ───────────────────────────────────────────────
// 基础几何工具
// ───────────────────────────────────────────────

/** 曼哈顿距离 */
function manhattan(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** 欧几里得距离 */
function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 是否相邻（四连通） */
function isAdjacent(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return manhattan(a, b) === 1;
}

/** 到棋盘中心的距离（归一化 0-1） */
function centerDistance(
  p: { x: number; y: number },
  size: number,
): number {
  const center = (size - 1) / 2;
  const maxDist = Math.hypot(center, center);
  return euclidean(p, { x: center, y: center }) / maxDist;
}

/** 到最近边界的距离 */
function edgeDistance(p: { x: number; y: number }, size: number): number {
  return Math.min(p.x, p.y, size - 1 - p.x, size - 1 - p.y);
}

/** 到最近角点的距离 */
function cornerDistance(p: { x: number; y: number }, size: number): number {
  const corners = [
    { x: 0, y: 0 },
    { x: size - 1, y: 0 },
    { x: 0, y: size - 1 },
    { x: size - 1, y: size - 1 },
  ];
  return Math.min(...corners.map((c) => manhattan(p, c)));
}

// ───────────────────────────────────────────────
// 领地估算（简化版 Voronoi）
// ───────────────────────────────────────────────

/** 返回每个格子的领地归属：'B' | 'W' | null（中立） */
function estimateTerritory(boardSize: number, stones: SgfMove[]): ("B" | "W" | null)[][] {
  const grid: ("B" | "W" | null)[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null),
  );

  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      // 先检查是否已有棋子
      const occupied = stones.find((s) => s.x === x && s.y === y);
      if (occupied) {
        grid[y][x] = occupied.color;
        continue;
      }

      let bestB = Infinity;
      let bestW = Infinity;

      for (const s of stones) {
        const d = manhattan({ x, y }, s);
        if (s.color === "B") bestB = Math.min(bestB, d);
        else bestW = Math.min(bestW, d);
      }

      if (bestB === Infinity && bestW === Infinity) continue;
      if (bestB < bestW) grid[y][x] = "B";
      else if (bestW < bestB) grid[y][x] = "W";
      // 相等则中立
    }
  }

  return grid;
}

// ───────────────────────────────────────────────
// 特征提取：五维度
// ───────────────────────────────────────────────

/**
 * 1. 风险偏好
 * 激进信号：中腹落子、侵入对方领地、切断对方
 * 保守信号：角部落子、边线低位、补棋连接
 */
function analyzeRisk(
  moves: SgfMove[],
  boardSize: number,
  territory: ("B" | "W" | null)[][],
  analyzedColor: "B" | "W",
): { score: number; moments: KeyMoment[] } {
  let aggressiveScore = 0;
  let conservativeScore = 0;
  const moments: KeyMoment[] = [];

  // 记录已落子位置（用于判断切断）
  const board: ("B" | "W" | null)[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null),
  );

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];

    // 始终更新棋盘（双方落子共同构成局面）
    board[m.y][m.x] = m.color;

    // 只统计被分析方的落子
    if (m.color !== analyzedColor) continue;

    const cd = centerDistance(m, boardSize);
    const ed = edgeDistance(m, boardSize);
    const cod = cornerDistance(m, boardSize);

    // 中腹落子（距离中心 < 0.4）= 激进
    if (cd < 0.35) {
      aggressiveScore += 2;
      if (i > 10 && i % 15 === 0) {
        moments.push({
          moveNumber: i + 1,
          color: m.color,
          x: m.x,
          y: m.y,
          type: "influence",
          description: `第${i + 1}手选择中腹高位，显示出宏大的全局视野`,
        });
      }
    }

    // 角部落子 = 保守
    if (cod <= 3) {
      conservativeScore += 1.5;
    }

    // 边线低位（距边 <= 2）且不在角 = 保守
    if (ed <= 2 && cod > 3) {
      conservativeScore += 1;
    }

    // 侵入对方领地
    if (territory[m.y][m.x] && territory[m.y][m.x] !== m.color) {
      aggressiveScore += 3;
      if (i > 20) {
        moments.push({
          moveNumber: i + 1,
          color: m.color,
          x: m.x,
          y: m.y,
          type: "invasion",
          description: `第${i + 1}手深入对方势力范围，展开激烈对抗`,
        });
      }
    }

    // 切断检测：落子后是否将对方两块棋分开
    const neighbors = [
      { x: m.x + 1, y: m.y },
      { x: m.x - 1, y: m.y },
      { x: m.x, y: m.y + 1 },
      { x: m.x, y: m.y - 1 },
    ].filter((n) => n.x >= 0 && n.x < boardSize && n.y >= 0 && n.y < boardSize);

    const oppNeighbors = neighbors.filter((n) => board[n.y][n.x] && board[n.y][n.x] !== m.color);
    if (oppNeighbors.length >= 2) {
      aggressiveScore += 2.5;
    }
  }

  const total = aggressiveScore + conservativeScore;
  const ratio = total > 0 ? aggressiveScore / total : 0.5;
  const score = Math.round(ratio * 100);

  return { score: Math.max(0, Math.min(100, score)), moments };
}

/**
 * 2. 逆境抗压
 * 分析棋局后期是否仍保持战略一致性
 * 简化：后半盘落子是否仍集中在有战略价值的区域
 */
function analyzeResilience(moves: SgfMove[], boardSize: number, analyzedColor: "B" | "W"): number {
  // 提取被分析方的落子
  const myMoves = moves.filter((m) => m.color === analyzedColor);
  if (myMoves.length < 10) return 50; // 该方落子太少，返回中性值

  const split = Math.floor(myMoves.length / 3);
  const early = myMoves.slice(0, split); // 前 1/3
  const late = myMoves.slice(split * 2); // 后 1/3

  // 计算每阶段的"平均中心距离"变化
  const avgCenterDist = (ms: SgfMove[]) => {
    if (ms.length === 0) return 0;
    return ms.reduce((sum, m) => sum + centerDistance(m, boardSize), 0) / ms.length;
  };

  const earlyDist = avgCenterDist(early);
  const lateDist = avgCenterDist(late);

  // 如果后期仍然保持类似的战略重心（而非漫无目的）= 抗压强
  // 同时检查后期落子的"聚集度"——有目的 vs 分散
  const spread = (ms: SgfMove[]) => {
    if (ms.length < 2) return 0;
    let totalDist = 0;
    let count = 0;
    for (let i = 1; i < ms.length; i++) {
      totalDist += manhattan(ms[i], ms[i - 1]);
      count++;
    }
    return count > 0 ? totalDist / count : 0;
  };

  const earlySpread = spread(early);
  const lateSpread = spread(late);

  // 后期落子仍然相对集中 = 保持专注 = 抗压强
  const spreadRatio = earlySpread > 0 ? lateSpread / earlySpread : 1;
  const consistency = Math.max(0, 1 - Math.abs(lateDist - earlyDist) / 0.5);

  const score = Math.round((consistency * 0.5 + Math.max(0, 1 - (spreadRatio - 1) * 0.5) * 0.5) * 100);
  return Math.max(20, Math.min(90, score));
}

/**
 * 3. 决策理性度
 * 检测在被包围区域继续填子的行为（沉没成本）
 * 高 = 理性（能及时止损），低 = 非理性（硬救死子）
 */
function analyzeRationality(
  moves: SgfMove[],
  boardSize: number,
  territory: ("B" | "W" | null)[][],
  analyzedColor: "B" | "W",
): { score: number; moments: KeyMoment[] } {
  const moments: KeyMoment[] = [];

  // 统计被分析方的落子数
  const myMoveCount = moves.filter((m) => m.color === analyzedColor).length;
  if (myMoveCount < 10) return { score: 50, moments };

  // 构建棋盘状态（逐步）
  const board: ("B" | "W" | null)[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null),
  );

  let irrationalCount = 0;
  let totalCount = 0;

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];

    // 始终更新棋盘
    board[m.y][m.x] = m.color;

    // 只统计被分析方
    if (m.color !== analyzedColor) continue;

    // 判断该落子是否在自己已经被包围的区域
    const neighbors = [
      { x: m.x + 1, y: m.y },
      { x: m.x - 1, y: m.y },
      { x: m.x, y: m.y + 1 },
      { x: m.x, y: m.y - 1 },
    ].filter((n) => n.x >= 0 && n.x < boardSize && n.y >= 0 && n.y < boardSize);

    const oppCount = neighbors.filter((n) => board[n.y][n.x] && board[n.y][n.x] !== m.color).length;
    const selfCount = neighbors.filter((n) => board[n.y][n.x] === m.color).length;

    // 在对方领地内且被对方包围的落子 = 非理性（硬撑）
    const isInOppTerritory = territory[m.y][m.x] !== null && territory[m.y][m.x] !== m.color;
    const isSurrounded = oppCount >= 3 && selfCount <= 1;

    if (i > 20 && isInOppTerritory && isSurrounded) {
      irrationalCount++;
      if (irrationalCount <= 3) {
        moments.push({
          moveNumber: i + 1,
          color: m.color,
          x: m.x,
          y: m.y,
          type: "resist",
          description: `第${i + 1}手在被包围区域继续投入，显示出较强的执念`,
        });
      }
    }

    totalCount++;
  }

  // 非理性落子占比越高，理性度越低
  const irrationalRatio = totalCount > 0 ? irrationalCount / totalCount : 0;
  const score = Math.round(Math.max(0, 100 - irrationalRatio * 500));
  return { score: Math.max(15, Math.min(95, score)), moments };
}

/**
 * 4. 冲突应对
 * 高 = 对抗型（正面刚），低 = 妥协型（退让）
 * 检测：对方靠过来时，是反击还是退让
 */
function analyzeConflict(
  moves: SgfMove[],
  boardSize: number,
  analyzedColor: "B" | "W",
): { score: number; moments: KeyMoment[] } {
  const moments: KeyMoment[] = [];
  if (moves.length < 10) return { score: 50, moments };

  const board: ("B" | "W" | null)[][] = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(null),
  );

  let confrontCount = 0;
  let retreatCount = 0;

  for (let i = 1; i < moves.length; i++) {
    const prev = moves[i - 1]; // 对方上一手
    const curr = moves[i]; // 我方回应

    // 只关注被分析方回应对方的场景
    if (curr.color !== analyzedColor || prev.color === curr.color) continue;

    // 判断是否是"对方靠过来"的情况
    const dist = manhattan(prev, curr);
    if (dist > 2) continue; // 离太远，不是直接回应

    // 检测回应方式
    const isAdjacentToOpp = isAdjacent(curr, prev);

    // 检查是否还有其他对方棋子在附近（多子接触 = 激烈对抗）
    const oppAround = [
      { x: curr.x + 1, y: curr.y },
      { x: curr.x - 1, y: curr.y },
      { x: curr.x, y: curr.y + 1 },
      { x: curr.x, y: curr.y - 1 },
    ].filter(
      (n) =>
        n.x >= 0 &&
        n.x < boardSize &&
        n.y >= 0 &&
        n.y < boardSize &&
        board[n.y][n.x] &&
        board[n.y][n.x] !== curr.color,
    ).length;

    if (isAdjacentToOpp || oppAround >= 2) {
      confrontCount++;
      if (confrontCount <= 3 && moments.length < 5) {
        moments.push({
          moveNumber: i + 1,
          color: curr.color,
          x: curr.x,
          y: curr.y,
          type: "resist",
          description: `第${i + 1}手选择正面迎战，展现出强硬的对抗姿态`,
        });
      }
    } else if (dist === 2) {
      // 跳/长 = 退让
      retreatCount++;
      if (retreatCount <= 2 && moments.length < 5) {
        moments.push({
          moveNumber: i + 1,
          color: curr.color,
          x: curr.x,
          y: curr.y,
          type: "giveUp",
          description: `第${i + 1}手选择退让一步，以稳为主`,
        });
      }
    }

    board[prev.y][prev.x] = prev.color;
  }

  const total = confrontCount + retreatCount;
  if (total === 0) return { score: 50, moments };

  const ratio = confrontCount / total;
  const score = Math.round(ratio * 100);
  return { score: Math.max(10, Math.min(95, score)), moments };
}

/**
 * 5. 专注力
 * 分析棋局前后期的落子"目的性"变化
 * 简化：后期是否出现更多远离双方棋子的"无目的落子"
 */
function analyzeFocus(moves: SgfMove[], boardSize: number, analyzedColor: "B" | "W"): number {
  // 提取被分析方的落子
  const myMoves = moves.filter((m) => m.color === analyzedColor);
  if (myMoves.length < 15) return 50;

  const split = Math.floor(myMoves.length / 3);
  const early = myMoves.slice(0, split);
  const mid = myMoves.slice(split, split * 2);
  const late = myMoves.slice(split * 2);

  // 计算每阶段的"平均意义度"
  // 意义度 = 该落子与最近已有棋子的距离（越近 = 越有意义）
  const meaningfulRatio = (ms: SgfMove[], allPrev: SgfMove[]) => {
    if (ms.length === 0) return 1;
    let meaningful = 0;
    for (const m of ms) {
      // 找到该落子之前最近的已落子
      const prevStones = allPrev.filter((p) => p !== m);
      if (prevStones.length === 0) {
        meaningful++;
        continue;
      }
      const minDist = Math.min(...prevStones.map((p) => manhattan(p, m)));
      // 距离 <= 3 认为是有意义的落子
      if (minDist <= 3) meaningful++;
    }
    return meaningful / ms.length;
  };

  const earlyRatio = meaningfulRatio(early, early);
  const midRatio = meaningfulRatio(mid, myMoves.slice(0, split * 2));
  const lateRatio = meaningfulRatio(late, myMoves);

  // 如果后期有意义落子比例显著下降 = 专注力不足
  const decline = earlyRatio > 0 ? (earlyRatio - lateRatio) / earlyRatio : 0;
  const score = Math.round(Math.max(0, 100 - decline * 200));

  return Math.max(20, Math.min(90, score));
}

// ───────────────────────────────────────────────
// 热力图生成
// ───────────────────────────────────────────────

function generateHeatmap(moves: SgfMove[], boardSize: number, analyzedColor: "B" | "W") {
  const grid: number[][] = Array.from({ length: boardSize }, () => Array(boardSize).fill(0));
  const peaks: { x: number; y: number; value: number }[] = [];

  // 只统计被分析方的落子热力
  const myMoves = moves.filter((m) => m.color === analyzedColor);

  for (const m of myMoves) {
    // 对周围施加高斯-like 影响
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = m.x + dx;
        const ny = m.y + dy;
        if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
          const dist = Math.hypot(dx, dy);
          const weight = Math.max(0, 1 - dist / 2.5);
          grid[ny][nx] += weight * 15;
        }
      }
    }
  }

  // 归一化到 0-100
  let maxVal = 0;
  for (const row of grid) {
    for (const v of row) {
      if (v > maxVal) maxVal = v;
    }
  }

  if (maxVal > 0) {
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        grid[y][x] = Math.round((grid[y][x] / maxVal) * 100);
        if (grid[y][x] >= 80) {
          peaks.push({ x, y, value: grid[y][x] });
        }
      }
    }
  }

  return { grid, peaks };
}

// ───────────────────────────────────────────────
// 标签生成
// ───────────────────────────────────────────────

function generateTags(radar: SgfRadar): string[] {
  const tags: string[] = [];

  if (radar.riskAppetite >= 65) tags.push("激进冒险");
  else if (radar.riskAppetite <= 35) tags.push("稳健保守");

  if (radar.resilience >= 65) tags.push("逆境抗压");
  else if (radar.resilience <= 35) tags.push("心态易崩");

  if (radar.rationality >= 65) tags.push("理性止损");
  else if (radar.rationality <= 35) tags.push("沉没成本");

  if (radar.conflictResponse >= 65) tags.push("对抗型");
  else if (radar.conflictResponse <= 35) tags.push("妥协型");

  if (radar.focus >= 65) tags.push("全程专注");
  else if (radar.focus <= 35) tags.push("后程乏力");

  // 组合标签
  if (radar.riskAppetite >= 60 && radar.conflictResponse >= 60) tags.push("进攻型棋手");
  if (radar.rationality >= 60 && radar.focus >= 60) tags.push("理性控盘者");
  if (radar.resilience >= 60 && radar.riskAppetite <= 40) tags.push("稳健防守型");

  return tags.length > 0 ? tags : ["均衡型棋手"];
}

// ───────────────────────────────────────────────
// 主分析入口
// ────────────────────────────────────────────

export function analyzeSgfGame(
  parsed: ParsedSgf,
  analyzedColor: "B" | "W" = "B",
): SgfAnalysis {
  const { boardSize, moves } = parsed;

  if (moves.length === 0) {
    return {
      radar: {
        riskAppetite: 50,
        resilience: 50,
        rationality: 50,
        conflictResponse: 50,
        focus: 50,
      },
      tags: ["数据不足"],
      keyMoments: [],
      moveCount: 0,
      boardSize,
      heatmap: { grid: Array.from({ length: boardSize }, () => Array(boardSize).fill(0)), peaks: [] },
    };
  }

  // 先估算领地（基于双方全部落子）
  const territory = estimateTerritory(boardSize, moves);

  // 五维度分析（按被分析方视角）
  const riskResult = analyzeRisk(moves, boardSize, territory, analyzedColor);
  const resilienceScore = analyzeResilience(moves, boardSize, analyzedColor);
  const rationalResult = analyzeRationality(moves, boardSize, territory, analyzedColor);
  const conflictResult = analyzeConflict(moves, boardSize, analyzedColor);
  const focusScore = analyzeFocus(moves, boardSize, analyzedColor);

  const radar: SgfRadar = {
    riskAppetite: riskResult.score,
    resilience: resilienceScore,
    rationality: rationalResult.score,
    conflictResponse: conflictResult.score,
    focus: focusScore,
  };

  // 合并关键节点
  const keyMoments = [
    ...riskResult.moments,
    ...rationalResult.moments,
    ...conflictResult.moments,
  ]
    .sort((a, b) => a.moveNumber - b.moveNumber)
    .slice(0, 8); // 最多展示 8 个

  const tags = generateTags(radar);
  const heatmap = generateHeatmap(moves, boardSize, analyzedColor);

  return {
    radar,
    tags,
    keyMoments,
    moveCount: moves.length,
    boardSize,
    heatmap,
  };
}
