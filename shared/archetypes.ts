/**
 * 心理原型定义与匹配算法（前后端共享）
 * 基于五维心理画像匹配最具代表性的人物原型
 */

import type { RadarData } from "./types.js";

export type Gender = "male" | "female";

export { RadarData };

/** 五维核心雷达（与 RadarData 等价） */
export interface CoreRadar {
  riskAppetite: number;
  resilience: number;
  rationality: number;
  conflictResponse: number;
  focus: number;
}

export interface Archetype {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  /** 各维度权重（用于计算匹配度，正值表示该维度越高越匹配） */
  weights: Partial<Record<keyof RadarData, number>>;
  /** 图片编号（对应 public/archetypes/ 下的 01_xxx.jpg） */
  imageIndex: number;
  /** 原型所属主维度 */
  primaryDimension: keyof RadarData;
}

const ARCHETYPES: Archetype[] = [
  // ─── 高风险偏好系 ───
  {
    id: "daredevil",
    name: "走钢丝的冒险家",
    subtitle: "高风险偏好",
    description: "你享受在悬崖边缘起舞，越是危险越能激发你的全部潜能。你相信高风险高回报，平庸的安稳只会让你感到厌倦。",
    weights: { riskAppetite: 3, conflictResponse: 1, focus: -0.5 },
    imageIndex: 1,
    primaryDimension: "riskAppetite",
  },
  {
    id: "gambler",
    name: "贴身肉搏的赌徒",
    subtitle: "高风险偏好 + 高对抗性",
    description: "你享受正面硬刚的快感，越是短兵相接的局面越能让你热血沸腾。你敢于all in，也敢于承担后果。",
    weights: { riskAppetite: 2.5, conflictResponse: 2, rationality: -1 },
    imageIndex: 2,
    primaryDimension: "riskAppetite",
  },
  {
    id: "dancer",
    name: "刀尖上的舞者",
    subtitle: "高风险偏好 + 高理性",
    description: "你在刀尖上起舞，每一步都精准计算。看似冒险的背后是缜密的算计与对节奏的极致掌控。",
    weights: { riskAppetite: 2.5, rationality: 2, focus: 1.5 },
    imageIndex: 3,
    primaryDimension: "riskAppetite",
  },

  // ─── 高沉没成本系（低理性） ───
  {
    id: "martyr",
    name: "执念的殉道者",
    subtitle: "低理性 + 高韧性",
    description: "你一旦认准的事，九头牛也拉不回来。哪怕撞了南墙，你也会选择把墙推倒。这份执念既是你的铠甲也是你的软肋。",
    weights: { rationality: -2.5, resilience: 1.5, conflictResponse: 0.5 },
    imageIndex: 4,
    primaryDimension: "rationality",
  },
  {
    id: "guardian",
    name: "舍不得的守陵人",
    subtitle: "低理性 + 低风险",
    description: "你对自己拥有的一切都格外珍视，哪怕已经失去意义，也难以割舍。你守的不是物件，是过往的岁月与情感。",
    weights: { rationality: -2, riskAppetite: -1.5, focus: 1 },
    imageIndex: 5,
    primaryDimension: "rationality",
  },
  {
    id: "devotee",
    name: "深情的执迷者",
    subtitle: "低理性 + 高共情",
    description: "你是情感的信徒，一旦投入便倾其所有。理性告诉你该放手的时候，心却还在原地徘徊。",
    weights: { rationality: -2, conflictResponse: -1, resilience: -0.5 },
    imageIndex: 6,
    primaryDimension: "rationality",
  },

  // ─── 高大局观系（高理性 + 高专注） ───
  {
    id: "helmsman",
    name: "掌舵的隐忍者",
    subtitle: "高理性 + 高韧性 + 低风险",
    description: "你是那种在惊涛骇浪中仍能稳坐钓鱼台的掌舵人。不争一时之长短，谋的是长远的航向。",
    weights: { rationality: 2, resilience: 2.5, riskAppetite: -1, focus: 1.5 },
    imageIndex: 7,
    primaryDimension: "rationality",
  },
  {
    id: "gardener",
    name: "谋局的园丁",
    subtitle: "高理性 + 高专注",
    description: "你像园丁一样精心布局，每一步都在为未来的枝繁叶茂埋下伏笔。你相信时间是你最好的朋友。",
    weights: { focus: 2, rationality: 2, riskAppetite: -1.5, resilience: 0.5 },
    imageIndex: 8,
    primaryDimension: "focus",
  },
  {
    id: "outsider",
    name: "棋盘外的棋手",
    subtitle: "极高理性 + 专注",
    description: "你下棋，但你更像是站在棋盘之外下棋。你看的不是棋子，是规则、是势、是人心。",
    weights: { rationality: 2.5, focus: 1.2, conflictResponse: -0.5 },
    imageIndex: 9,
    primaryDimension: "focus",
  },
  {
    id: "architect",
    name: "布局的建筑师",
    subtitle: "高理性 + 高专注 + 中等风险",
    description: "你是棋局的建筑师，每一手都在构筑你的蓝图之中。你享受从全局视角出发，构建属于你的建筑。",
    weights: { focus: 2.5, riskAppetite: 1.5, rationality: 1.5, resilience: 0.5 },
    imageIndex: 10,
    primaryDimension: "focus",
  },

  // ─── 高掌控欲系（高对抗 + 高理性） ───
  {
    id: "emperor",
    name: "全局统御的帝王",
    subtitle: "高对抗 + 高理性 + 高专注",
    description: "你天生带有掌控全局的气场，每一寸领地都在你的版图之内。你要的不是赢一局，是整个天下。",
    weights: { conflictResponse: 2.5, rationality: 1.5, focus: 1, riskAppetite: 0.5 },
    imageIndex: 11,
    primaryDimension: "conflictResponse",
  },
  {
    id: "commander",
    name: "中军帐里的指挥官",
    subtitle: "高对抗 + 高韧性 + 中等理性",
    description: "你是战场的指挥者，运筹帷幄之中，决胜千里之外。压力越大，你越冷静。",
    weights: { conflictResponse: 2, resilience: 1.5, rationality: 1 },
    imageIndex: 12,
    primaryDimension: "conflictResponse",
  },
  {
    id: "puppeteer",
    name: "操控木偶的戏师",
    subtitle: "高理性 + 高对抗 + 高风险",
    description: "你是无形的手，牵引着每一根线。别人以为是自己走的每一步，其实都在你的剧本之中。",
    weights: { rationality: 2, conflictResponse: 1.5, riskAppetite: 1, focus: 0.5 },
    imageIndex: 13,
    primaryDimension: "conflictResponse",
  },

  // ─── 高情绪稳定性系（高韧性 + 低风险） ───
  {
    id: "rock",
    name: "不动如山的磐石",
    subtitle: "高韧性 + 低风险 + 高理性",
    description: "你是那座山，任他风吹雨打，我自岿然不动。你的稳定感是身边人最大的安全感来源。",
    weights: { resilience: 3, riskAppetite: -1.5, rationality: 1 },
    imageIndex: 14,
    primaryDimension: "resilience",
  },
  {
    id: "diver",
    name: "深海里的潜水员",
    subtitle: "高韧性 + 高专注 + 低对抗",
    description: "你能在深海里独自潜行，外界的喧嚣与你无关。你享受独处，也享受深度思考带来的宁静。",
    weights: { resilience: 3, focus: 2.5, conflictResponse: -1.5 },
    imageIndex: 15,
    primaryDimension: "resilience",
  },

  // ─── 高合作倾向系（低对抗 + 高理性） ───
  {
    id: "mediator",
    name: "以和为贵的调停者",
    subtitle: "低对抗 + 高理性 + 中韧性",
    description: "你相信共赢才是最高明的策略。你擅长在矛盾中找到平衡点，让对立的双方都能各得其所。",
    weights: { conflictResponse: -2.5, rationality: 1.5, resilience: 1 },
    imageIndex: 16,
    primaryDimension: "conflictResponse",
  },
  {
    id: "collaborator",
    name: "润物无声的合作者",
    subtitle: "低对抗 + 高韧性 + 高专注",
    description: "你像水一样，柔弱却能滋养万物。你用润物细无声的方式，把事情做成了。",
    weights: { conflictResponse: -2.5, focus: 2.5, resilience: 1.5, rationality: 0.5 },
    imageIndex: 17,
    primaryDimension: "conflictResponse",
  },

  // ─── 创新与突破系 ───
  {
    id: "gamechanger",
    name: "跳出棋盘的造局者",
    subtitle: "高理性 + 高专注 + 破局思维",
    description: "你从不满足于在既定规则内博弈，你更擅长改写规则本身。当别人还在棋盘内厮杀时，你已经重新定义了棋盘。",
    weights: { rationality: 2, focus: 2, riskAppetite: 1, conflictResponse: 0.5 },
    imageIndex: 18,
    primaryDimension: "rationality",
  },
  {
    id: "pioneer",
    name: "破局而出的先行者",
    subtitle: "高风险 + 高决断 + 高对抗",
    description: "你是第一个冲破旧格局的人。当所有人还在观望时，你已经迈出了第一步。前路未知，但你从不畏惧。",
    weights: { riskAppetite: 3, conflictResponse: 2, rationality: 0.5, focus: 0.5 },
    imageIndex: 19,
    primaryDimension: "riskAppetite",
  },
  {
    id: "waiter",
    name: "静待花开的守望者",
    subtitle: "高韧性 + 高专注 + 低风险",
    description: "你相信时间的力量，愿意为了长远的结果耐心守候。别人看到的是静止，你看到的是悄然生长。",
    weights: { resilience: 2.5, focus: 2.2, riskAppetite: -2.5, rationality: 0.5 },
    imageIndex: 20,
    primaryDimension: "focus",
  },
  {
    id: "cultivator",
    name: "细水长流的修行者",
    subtitle: "高韧性 + 高专注 + 中理性",
    description: "你把人生当作一场修行，不求速成，但求日拱一卒。每一步都走得扎实，每一次呼吸都是修炼。",
    weights: { focus: 2.5, resilience: 2.5, rationality: 1, riskAppetite: -0.5 },
    imageIndex: 21,
    primaryDimension: "focus",
  },

  // ─── 高决断力系 ───
  {
    id: "decisive",
    name: "快刀斩乱麻的决策者",
    subtitle: "高理性 + 高风险 + 高对抗",
    description: "你做决策从不拖泥带水，当断则断，是你的风格。混乱的局面中，你是那个一锤定音的人。",
    weights: { rationality: 2, riskAppetite: 2, conflictResponse: 2, focus: 0.5 },
    imageIndex: 22,
    primaryDimension: "rationality",
  },
  {
    id: "actionist",
    name: "当机立断的行动派",
    subtitle: "高风险 + 高专注 + 高对抗",
    description: "你是行动的巨人，想到就去做。你不喜欢纸上谈兵，战场上的硝烟才是你真正的舞台。",
    weights: { riskAppetite: 2.5, conflictResponse: 2, focus: 1.5, rationality: 0.5 },
    imageIndex: 23,
    primaryDimension: "riskAppetite",
  },
];

/**
 * 计算各维度归一化到 -1 ~ 1 的权重
 * 50 分 = 0，100 分 = 1，0 分 = -1
 */
function normalize(score: number): number {
  return Math.max(-1, Math.min(1, (score - 50) / 50));
}

/**
 * 匹配最佳原型
 * 算法：对每个原型计算加权得分，取最高者
 */
export function matchArchetype(radar: RadarData): Archetype {
  const norm = {
    riskAppetite: normalize(radar.riskAppetite),
    resilience: normalize(radar.resilience),
    rationality: normalize(radar.rationality),
    conflictResponse: normalize(radar.conflictResponse),
    focus: normalize(radar.focus),
  };

  let best = ARCHETYPES[0];
  let bestScore = -Infinity;

  for (const arch of ARCHETYPES) {
    let score = 0;
    for (const [key, weight] of Object.entries(arch.weights)) {
      score += (norm[key as keyof RadarData] || 0) * (weight || 0);
    }
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }

  return best;
}

/**
 * 根据五维雷达生成性格标签
 * 测试题与 SGF 棋谱分析共用同一套标签规则
 */
export function generateTags(radar: RadarData): string[] {
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

export { ARCHETYPES };
