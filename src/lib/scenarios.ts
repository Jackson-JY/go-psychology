import type { Scenario } from "@/lib/types";

/**
 * 4 关残局配置
 * 9x9 棋盘，坐标原点 (0,0) 在左上角
 */

// 第 1 关 · 死活困境：测试损失厌恶与止损决策
// 黑棋在二路被白棋三路厚壁压制，左边已被封住
// A. 继续爬二路试图突围/联络（损失厌恶）
// B. 放弃底部黑子，转而在中腹/边路开辟新战场（止损）
const lifeDeathStones = [
  // 黑棋：二路连续4子，已被压制
  { x: 1, y: 7, color: "B" as const },
  { x: 2, y: 7, color: "B" as const },
  { x: 3, y: 7, color: "B" as const },
  { x: 4, y: 7, color: "B" as const },
  // 白棋：三路厚壁6子，完全压制黑棋上方
  { x: 0, y: 6, color: "W" as const },
  { x: 1, y: 6, color: "W" as const },
  { x: 2, y: 6, color: "W" as const },
  { x: 3, y: 6, color: "W" as const },
  { x: 4, y: 6, color: "W" as const },
  { x: 5, y: 6, color: "W" as const },
  // 白棋：左边封住黑棋去路
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
    copy: {
      beginner: {
        title: "困",
        subtitle: "困境抉择",
        prompt: "你的一支小队被困在峡谷底部，上方有敌人重兵把守。你决定？",
        hint: "红色区域：继续救援被困小队  ·  蓝色区域：放弃小队，另寻出路",
        optionA: "继续救援",
        optionB: "放弃转移",
      },
      skilled: {
        title: "困",
        subtitle: "死活困境",
        prompt: "黑棋二路被白棋三路厚壁压制，左边已被封住。你选择？",
        hint: "A. 继续爬二路试图突围  B. 弃子封外，在外围构筑厚势",
      },
    },
    stones: lifeDeathStones,
    focus: { x: 2, y: 6 },
  },
  {
    id: "opening",
    index: 2,
    copy: {
      beginner: {
        title: "始",
        subtitle: "开局策略",
        prompt: "面对一个全新的机会，你更想先拿到手的好处，还是先占住有利位置？",
        hint: "红色区域：先拿到确定的好处  ·  蓝色区域：先占据中心有利位置",
        optionA: "拿到手再说",
        optionB: "占住中心",
      },
      skilled: {
        title: "始",
        subtitle: "布局偏好",
        prompt: "面对全新的项目启动期，你更倾向于哪种开局策略？",
        hint: "A. 稳扎稳打先拿实地  B. 布局宏大占据中央",
      },
    },
    stones: openingStones,
  },
  {
    id: "invasion",
    index: 3,
    copy: {
      beginner: {
        title: "侵",
        subtitle: "冲突应对",
        prompt: "对方突然对你提出了不合理且带有挑衅的要求，你的第一反应是？",
        hint: "红色区域：正面硬碰硬顶回去  ·  蓝色区域：退让一步，稳住阵脚",
        optionA: "正面迎击",
        optionB: "退让稳守",
      },
      skilled: {
        title: "侵",
        subtitle: "侵犯应对",
        prompt: "对方突然对你提出了不合理且带有挑衅性质的竞争要求，你的第一反应是？",
        hint: "A. 正面迎头痛击  B. 退让一步稳住阵脚",
      },
    },
    stones: invasionStones,
    focus: { x: 3, y: 4 },
  },
  {
    id: "ko",
    index: 4,
    copy: {
      beginner: {
        title: "劫",
        subtitle: "多线取舍",
        prompt: "你和一个对手在争执一件小事，僵持不下。这时另一个机会出现了，你会？",
        hint: "红色区域：继续争执到底  ·  蓝色区域：放手争议，抓住新机会",
        optionA: "争执到底",
        optionB: "转向新机",
      },
      skilled: {
        title: "劫",
        subtitle: "劫争转换",
        prompt: "你与竞争对手在主战场陷入了焦灼的拉锯战，此时对方在侧翼发起了骚扰，你会？",
        hint: "A. 紧盯主战场必须打赢  B. 避其锋芒换取侧翼开花",
      },
    },
    stones: koStones,
    focus: { x: 7, y: 1 },
  },
];
