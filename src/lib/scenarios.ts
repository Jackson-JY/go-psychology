import type { Scenario } from "@/lib/types";

/**
 * 4 关残局配置
 * 9x9 棋盘，坐标原点 (0,0) 在左上角
 */

// 第 1 关 · 死活困境：测试损失厌恶与止损决策
// 黑棋左下角 4-5 子被白棋包围，濒临死亡
const lifeDeathStones = [
  // 左下角被围的黑子
  { x: 1, y: 7, color: "B" as const },
  { x: 1, y: 6, color: "B" as const },
  { x: 2, y: 7, color: "B" as const },
  { x: 2, y: 6, color: "B" as const },
  // 包围的白子
  { x: 0, y: 8, color: "W" as const },
  { x: 1, y: 8, color: "W" as const },
  { x: 2, y: 8, color: "W" as const },
  { x: 3, y: 8, color: "W" as const },
  { x: 3, y: 7, color: "W" as const },
  { x: 3, y: 6, color: "W" as const },
  { x: 3, y: 5, color: "W" as const },
  { x: 2, y: 5, color: "W" as const },
  { x: 1, y: 5, color: "W" as const },
  { x: 0, y: 5, color: "W" as const },
  { x: 0, y: 6, color: "W" as const },
  { x: 0, y: 7, color: "W" as const },
];

// 第 2 关 · 布局偏好：测试安全感倾向与控制欲
// 开局阶段，黑棋已占一角，轮到你行棋
const openingStones = [
  { x: 1, y: 1, color: "B" as const },
  { x: 1, y: 7, color: "W" as const },
  { x: 7, y: 7, color: "B" as const },
];

// 第 3 关 · 侵犯应对：测试攻击性与冲突应对模式
// 黑棋在左边有稳固阵地，白棋强行刺入挑衅
const invasionStones = [
  // 黑棋在左边的阵地
  { x: 1, y: 3, color: "B" as const },
  { x: 1, y: 4, color: "B" as const },
  { x: 1, y: 5, color: "B" as const },
  { x: 2, y: 3, color: "B" as const },
  { x: 2, y: 4, color: "B" as const },
  { x: 2, y: 5, color: "B" as const },
  // 白棋挑衅的刺入一子
  { x: 3, y: 4, color: "W" as const },
];

// 第 4 关 · 劫争转换：测试隧道视野与多任务应变
// 右上角在打劫，白棋找劫材，轮到你处理
const koStones = [
  // 右上角劫争形态
  { x: 7, y: 1, color: "B" as const },
  { x: 8, y: 1, color: "W" as const },
  { x: 7, y: 2, color: "W" as const },
  { x: 8, y: 2, color: "B" as const },
  { x: 6, y: 2, color: "W" as const },
  // 左下角白棋阵营
  { x: 1, y: 6, color: "W" as const },
  { x: 2, y: 6, color: "W" as const },
  { x: 1, y: 7, color: "W" as const },
  { x: 2, y: 7, color: "W" as const },
  { x: 3, y: 6, color: "W" as const },
  // 左下角黑棋周边子
  { x: 0, y: 5, color: "B" as const },
  { x: 4, y: 8, color: "B" as const },
];

export const SCENARIOS: Scenario[] = [
  {
    id: "lifeDeath",
    index: 1,
    title: "困",
    subtitle: "死活困境",
    prompt: "你的先锋部队已被敌军重重包围，面临歼灭风险。你决定？",
    hint: "A. 强行突围救回残子  B. 弃子封外，构筑厚势",
    stones: lifeDeathStones,
    focus: { x: 2, y: 6 },
  },
  {
    id: "opening",
    index: 2,
    title: "始",
    subtitle: "布局偏好",
    prompt: "面对全新的项目启动期，你更倾向于哪种开局策略？",
    hint: "A. 稳扎稳打先拿实地  B. 布局宏大占据中央",
    stones: openingStones,
  },
  {
    id: "invasion",
    index: 3,
    title: "侵",
    subtitle: "侵犯应对",
    prompt: "对方突然对你提出了不合理且带有挑衅性质的竞争要求，你的第一反应是？",
    hint: "A. 正面迎头痛击  B. 退让一步稳住阵脚",
    stones: invasionStones,
    focus: { x: 3, y: 4 },
  },
  {
    id: "ko",
    index: 4,
    title: "劫",
    subtitle: "劫争转换",
    prompt: "你与竞争对手在主战场陷入了焦灼的拉锯战，此时对方在侧翼发起了骚扰，你会？",
    hint: "A. 紧盯主战场必须打赢  B. 避其锋芒换取侧翼开花",
    stones: koStones,
    focus: { x: 7, y: 1 },
  },
];
