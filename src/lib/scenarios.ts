import type { Scenario } from "@/lib/types";

/**
 * 3 关残局配置
 * 9x9 棋盘，坐标原点 (0,0) 在左上角
 */

// 第 1 关 · 围：黑 3 子被白 5 子包围
const siegeStones = [
  // 中央被围的黑子
  { x: 4, y: 4, color: "B" as const },
  { x: 3, y: 4, color: "B" as const },
  { x: 4, y: 3, color: "B" as const },
  // 包围的白子
  { x: 2, y: 4, color: "W" as const },
  { x: 5, y: 4, color: "W" as const },
  { x: 4, y: 2, color: "W" as const },
  { x: 4, y: 5, color: "W" as const },
  { x: 3, y: 5, color: "W" as const },
];

// 第 2 关 · 贪：中央有黑白交错的肥肉
const greedStones = [
  // 中央肥肉周围散落的黑白
  { x: 3, y: 3, color: "B" as const },
  { x: 5, y: 3, color: "W" as const },
  { x: 3, y: 5, color: "W" as const },
  { x: 5, y: 5, color: "B" as const },
  { x: 6, y: 4, color: "W" as const },
  { x: 2, y: 4, color: "B" as const },
  // 角部已有黑子（可作为退守点）
  { x: 0, y: 0, color: "B" as const },
  { x: 8, y: 8, color: "W" as const },
];

// 第 3 关 · 局：全盘稀疏开局
const overallStones = [
  { x: 2, y: 2, color: "B" as const },
  { x: 6, y: 2, color: "W" as const },
  { x: 2, y: 6, color: "W" as const },
  { x: 6, y: 6, color: "B" as const },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "siege",
    index: 1,
    title: "围",
    subtitle: "团队被围",
    prompt: "你的团队正陷入重围。作为黑方，你的第一反应落在哪里？",
    hint: "不必算棋，凭直觉点击交叉点",
    stones: siegeStones,
    focus: { x: 4, y: 4 },
  },
  {
    id: "greed",
    index: 2,
    title: "贪",
    subtitle: "投资抉择",
    prompt: "眼前是一块肥肉，但后手有险。你会落子抢食，还是退守？",
    hint: "贪与稳，一念之间",
    stones: greedStones,
    focus: { x: 4, y: 4 },
  },
  {
    id: "overall",
    index: 3,
    title: "局",
    subtitle: "大局博弈",
    prompt: "大局未定，胜负系于一手。你的直觉指向何处？",
    hint: "格局，藏在你的第一手里",
    stones: overallStones,
  },
];
