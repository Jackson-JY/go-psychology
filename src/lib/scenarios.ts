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
    title: "困",
    subtitle: "身陷困境",
    prompt: "你的团队陷入了困境。作为决策者，你会选择救援被围的同伴，还是果断放弃转向新的机会？",
    hint: "凭第一反应点击棋盘",
    stones: siegeStones,
    focus: { x: 4, y: 4 },
  },
  {
    id: "greed",
    index: 2,
    title: "诱",
    subtitle: "诱惑面前",
    prompt: "眼前有一个诱人的机会，但风险未知。你会选择把握机会，还是稳妥撤退？",
    hint: "欲望与理智，你会倾向哪一边",
    stones: greedStones,
    focus: { x: 4, y: 4 },
  },
  {
    id: "overall",
    index: 3,
    title: "远",
    subtitle: "长远布局",
    prompt: "一切刚刚开始，胜负未定。你的直觉会把第一颗棋子放在哪里？",
    hint: "你的选择将决定未来的格局",
    stones: overallStones,
  },
];
